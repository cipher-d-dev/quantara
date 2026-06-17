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
      created_at: row.created_at,
      course,
    };
  });
}

async function registerForCourse(userId: string, courseId: string) {
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

  const { error } = await supabase.from('registrations').insert({
    user_id: userId,
    course_id: courseId,
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('You are already registered for this course');
    }
    throw error;
  }
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
    mutationFn: ({ userId, courseId }: { userId: string; courseId: string }) =>
      registerForCourse(userId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}

export function useUnregisterFromCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unregisterFromCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}
