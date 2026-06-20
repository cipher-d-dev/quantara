export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: 'student' | 'admin';
          phone: string | null;
          department: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          role?: 'student' | 'admin';
          phone?: string | null;
          department?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: 'student' | 'admin';
          phone?: string | null;
          department?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          max_slots: number;
          registration_open: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          max_slots?: number;
          registration_open?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          title?: string;
          description?: string | null;
          max_slots?: number;
          registration_open?: boolean;
          created_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          package_type: 'basic' | 'pro';
          delivery_location: string;
          payment_reference: string | null;
          payment_status: 'pending' | 'paid' | 'failed';
          amount_kobo: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          package_type?: 'basic' | 'pro';
          delivery_location?: string;
          payment_reference?: string | null;
          payment_status?: 'pending' | 'paid' | 'failed';
          amount_kobo?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          package_type?: 'basic' | 'pro';
          delivery_location?: string;
          payment_reference?: string | null;
          payment_status?: 'pending' | 'paid' | 'failed';
          amount_kobo?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Registration = Database['public']['Tables']['registrations']['Row'];
export type RegistrationPackage = Registration['package_type'];

export type CourseWithSlots = Course & {
  registered_count: number;
  remaining_slots: number;
  is_registered?: boolean;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
};
