import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Course, Profile, Registration } from '../types/database';

async function getAdminStats() {
  const [studentsResult, coursesResult, registrationsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
    supabase.from('registrations').select('id', { count: 'exact', head: true }),
  ]);

  const { data: coursesData } = await supabase.from('courses').select('max_slots');

  const totalSlots = coursesData?.reduce((sum, c) => sum + c.max_slots, 0) || 0;

  return {
    totalStudents: studentsResult.count || 0,
    totalCourses: coursesResult.count || 0,
    totalRegistrations: registrationsResult.count || 0,
    totalSlots,
  };
}

async function getAllCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getAllStudents(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function getAllRegistrations() {
  const { data, error } = await supabase
    .from('registrations')
    .select(
      `
      id,
      created_at,
      package_type,
      delivery_location,
      payment_reference,
      payment_status,
      amount_kobo,
      outline_url,
      user:profiles (id, full_name, email, phone, department),
      course:courses (id, code, title)
    `
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data as unknown) as (Registration & {
    user: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'department'>;
    course: Pick<Course, 'id' | 'code' | 'title'>;
  })[];
}

async function createCourse(
  course: Omit<Course, 'id' | 'created_at'>
): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .insert(course)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCourse(
  id: string,
  updates: Partial<Omit<Course, 'id' | 'created_at'>>
): Promise<Course> {
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteCourse(id: string) {
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) throw error;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: getAdminStats,
  });
}

export function useAllCourses() {
  return useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: getAllCourses,
  });
}

export function useAllStudents() {
  return useQuery({
    queryKey: ['admin', 'students'],
    queryFn: getAllStudents,
  });
}

export function useAllRegistrations() {
  return useQuery({
    queryKey: ['admin', 'registrations'],
    queryFn: getAllRegistrations,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<Course, 'id' | 'created_at'>> }) =>
      updateCourse(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
