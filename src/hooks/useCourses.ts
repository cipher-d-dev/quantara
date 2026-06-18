import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { CourseWithSlots } from '../types/database';

async function getCourses(): Promise<CourseWithSlots[]> {
  const { data: courses, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Get registration counts via RPC function
  const { data: counts, error: countError } = await supabase.rpc('get_course_registration_counts');

  if (countError) throw countError;

  const countMap = (counts || []).reduce((acc: Record<string, number>, item: { course_id: string; count: number }) => {
    acc[item.course_id] = item.count;
    return acc;
  }, {} as Record<string, number>);

  return courses.map((course) => ({
    ...course,
    registered_count: countMap[course.id] || 0,
    remaining_slots: course.max_slots - (countMap[course.id] || 0),
  }));
}

async function getCoursesForUser(userId: string): Promise<CourseWithSlots[]> {
  const courses = await getCourses();

  const { data: userRegistrations } = await supabase
    .from('registrations')
    .select('course_id')
    .eq('user_id', userId);

  const registeredCourseIds = new Set(userRegistrations?.map((r) => r.course_id) || []);

  return courses.map((course) => ({
    ...course,
    is_registered: registeredCourseIds.has(course.id),
  }));
}

async function getMyRegistrations(userId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select(
      `
      id,
      package_type,
      delivery_location,
      payment_reference,
      payment_status,
      amount_kobo,
      created_at,
      course:courses (*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => {
    const course = Array.isArray(row.course) ? row.course[0] : row.course;
    return {
      id: row.id,
      user_id: userId,
      course_id: course.id,
      package_type: row.package_type,
      delivery_location: row.delivery_location,
      payment_reference: row.payment_reference,
      payment_status: row.payment_status,
      amount_kobo: row.amount_kobo,
      created_at: row.created_at,
      course,
    };
  });
}

async function registerForCourse(
  userId: string,
  courseId: string,
  packageType: 'basic' | 'pro' = 'basic',
  deliveryLocation: string = 'The Engineering Civil Shed',
  paymentReference: string | null = null,
  paymentStatus: 'pending' | 'paid' | 'failed' = 'paid',
  amountKobo: number = 0
) {
  if (paymentReference) {
    const { data: existingPaymentRegistration, error: existingPaymentError } = await supabase
      .from('registrations')
      .select('id')
      .eq('payment_reference', paymentReference)
      .maybeSingle();

    if (existingPaymentError) throw existingPaymentError;
    if (existingPaymentRegistration) return;
  }

  const { data: existingRegistration, error: existingError } = await supabase
    .from('registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingRegistration) return;

  const { data: course } = await supabase
    .from('courses')
    .select('max_slots, registration_open')
    .eq('id', courseId)
    .single();

  if (!course) throw new Error('Course not found');
  if (!course.registration_open) throw new Error('Registration is closed for this course');

  const { count } = await supabase
    .from('registrations')
    .select('*', { count: 'exact', head: true })
    .eq('course_id', courseId);

  if (count !== null && count >= course.max_slots) {
    throw new Error('No slots available');
  }

  const { error } = await supabase.from('registrations').upsert(
    {
      user_id: userId,
      course_id: courseId,
      package_type: packageType,
      delivery_location: deliveryLocation,
      payment_reference: paymentReference,
      payment_status: paymentStatus,
      amount_kobo: amountKobo,
    },
    {
      onConflict: 'user_id,course_id',
      ignoreDuplicates: true,
    }
  );

  if (error) {
    if (error.code === '23505' || error.message.toLowerCase().includes('duplicate')) {
      return;
    }
    throw error;
  }
}

async function hasRegistration(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

async function hasRegistrationForPaymentReference(paymentReference: string) {
  const { data, error } = await supabase
    .from('registrations')
    .select('id')
    .eq('payment_reference', paymentReference)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

async function unregisterFromCourse(registrationId: string) {
  const { error } = await supabase
    .from('registrations')
    .delete()
    .eq('id', registrationId);

  if (error) throw error;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: getCourses,
  });
}

export function useCoursesForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['courses', 'user', userId],
    queryFn: () => getCoursesForUser(userId!),
    enabled: !!userId,
  });
}

export function useCatalogCourses(userId?: string) {
  return useQuery({
    queryKey: ['courses', 'catalog', userId ?? 'guest'],
    queryFn: async (): Promise<CourseWithSlots[]> => {
      const courses = await getCourses();
      if (!userId) return courses;

      const { data: userRegistrations } = await supabase
        .from('registrations')
        .select('course_id')
        .eq('user_id', userId);

      const registeredCourseIds = new Set(userRegistrations?.map((r) => r.course_id) || []);

      return courses.map((course) => ({
        ...course,
        is_registered: registeredCourseIds.has(course.id),
      }));
    },
  });
}

export function useMyRegistrations(userId: string | undefined) {
  return useQuery({
    queryKey: ['registrations', userId],
    queryFn: () => getMyRegistrations(userId!),
    enabled: !!userId,
  });
}

export function useRegisterForCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    mutationFn: ({
      userId,
      courseId,
      packageType,
      deliveryLocation,
      paymentReference,
      paymentStatus,
      amountKobo,
    }: {
      userId: string;
      courseId: string;
      packageType?: 'basic' | 'pro';
      deliveryLocation?: string;
      paymentReference?: string | null;
      paymentStatus?: 'pending' | 'paid' | 'failed';
      amountKobo?: number;
    }) =>
      registerForCourse(
        userId,
        courseId,
        packageType,
        deliveryLocation,
        paymentReference,
        paymentStatus,
        amountKobo
      ),
  });
}

export function useUnregisterFromCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unregisterFromCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useHasRegistration() {
  return useMutation({
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      hasRegistration(userId, courseId),
  });
}

export function useHasRegistrationForPaymentReference() {
  return useMutation({
    mutationFn: (paymentReference: string) => hasRegistrationForPaymentReference(paymentReference),
  });
}
