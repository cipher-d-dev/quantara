import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, User } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileLoading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string, department?: string) => Promise<{ data: any; error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (fullName: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const applyProfile = useCallback((data: Profile) => {
    setProfile(data);
    setUser({
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
    });
  }, []);

  const applySessionUserFallback = useCallback((sessionUser: Session['user']) => {
    setProfile(null);
    setUser({
      id: sessionUser.id,
      email: sessionUser.email ?? '',
      full_name:
        sessionUser.user_metadata?.full_name ||
        sessionUser.user_metadata?.name ||
        sessionUser.email ||
        'New User',
      role: 'student',
    });
  }, []);

  const fetchProfile = useCallback(async (userId: string, sessionUser?: any) => {
    setProfileLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data && sessionUser) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: sessionUser.id,
            email: sessionUser.email,
            full_name:
              sessionUser.user_metadata?.full_name ||
              sessionUser.user_metadata?.name ||
              sessionUser.email ||
              'New User',
            role: 'student',
            phone: sessionUser.user_metadata?.phone ?? null,
            department: sessionUser.user_metadata?.department ?? null,
          });

        if (!insertError) {
          const { data: newProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

          if (newProfile) {
            applyProfile(newProfile);
          }
        }

        return;
      }

      if (!data) return;
      applyProfile(data);
    } catch {
      if (sessionUser) {
        applySessionUserFallback(sessionUser);
      } else {
        setUser(null);
        setProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  }, [applyProfile, applySessionUserFallback]);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (initialSession) {
          setSession(initialSession);
          applySessionUserFallback(initialSession.user);
          setLoading(false);
          void fetchProfile(initialSession.user.id, initialSession.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileLoading(false);
          setLoading(false);
        }
      } catch {
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setProfileLoading(false);
          setLoading(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession?.user) {
          applySessionUserFallback(newSession.user);
          setLoading(false);
          void fetchProfile(newSession.user.id, newSession.user);
        } else {
          setUser(null);
          setProfile(null);
          setProfileLoading(false);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [applySessionUserFallback, fetchProfile]);

  const signUp = async (email: string, password: string, fullName: string, phone?: string, department?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone ?? null,
            department: department ?? null,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      return { data, error: error as Error | null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateProfile = async (fullName: string) => {
    if (!user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;

      const { data: { user: sessionUser } } = await supabase.auth.getUser();

      if (!sessionUser) {
        throw new Error('User not authenticated');
      }
      if (sessionUser.id !== user.id) {
        throw new Error('Auth (User ID) mismatch');
      }
      await fetchProfile(user.id, sessionUser ?? undefined);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        profileLoading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getDefaultRouteForRole(role: User['role']) {
  return role === 'admin' ? '/admin' : '/dashboard';
}
