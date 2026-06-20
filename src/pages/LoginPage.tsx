import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Logo from '../components/ui/Logo';
import gsap from 'gsap';
import { useAuth, getDefaultRouteForRole } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Button, Input } from '../components/ui';
import AuthCharacter, { AuthCharacterHandle } from '../components/AuthCharacter';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

async function getPostAuthRoute() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return '/dashboard';
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return getDefaultRouteForRole(profile?.role ?? 'student');
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const cardRef = useRef<HTMLDivElement>(null);
  const charRef = useRef<AuthCharacterHandle>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, { y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', delay: 0.15 });
    });
    return () => ctx.revert();
  }, []);

  const handleTyping = useCallback(() => {
    charRef.current?.setState('typing');
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => charRef.current?.setState('idle'), 800);
  }, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      charRef.current?.setState('error');
      setTimeout(() => charRef.current?.setState('idle'), 1200);
      return;
    }
    setLoading(true);
    charRef.current?.setState('loading');
    const { error } = await signIn(email, password);
    if (error) {
      charRef.current?.setState('error');
      setTimeout(() => charRef.current?.setState('idle'), 1500);
      toast.error('Sign in failed', error.message);
      setLoading(false);
      return;
    }
    charRef.current?.setState('success');
    toast.success('Welcome back!');
    navigate(from ?? (await getPostAuthRoute()));
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { toast.error('Google sign in failed', error.message); setGoogleLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!email) { toast.warning('Enter your email address first'); return; }
    setResetLoading(true);
    const { error } = await resetPassword(email);
    setResetLoading(false);
    if (error) { toast.error('Password reset failed', error.message); return; }
    toast.success('Check your email for a reset link');
  };

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* ── Left: Character panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        {/* Background radial */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(99,102,241,0.12)_0%,transparent_70%)]" />

        <div className="relative z-10 p-8">
          <Link to="/" className="flex items-center gap-3 cursor-pointer w-fit">
            <Logo />
            <span className="text-lg font-bold text-white tracking-tight">Quantara</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {/* Floating stat chips */}
          <div className="absolute top-6 left-8 flex items-center gap-2 rounded-2xl bg-surface-900/70 border border-surface-700/50 px-3.5 py-2.5 backdrop-blur-sm animate-float shadow-soft">
            <span className="w-2 h-2 rounded-full bg-success-400 shrink-0" />
            <span className="text-xs text-surface-200 font-medium">AI Ready</span>
          </div>
          <div className="absolute bottom-16 right-6 flex items-center gap-2 rounded-2xl bg-surface-900/70 border border-surface-700/50 px-3.5 py-2.5 backdrop-blur-sm animate-float float-delay-2 shadow-soft">
            <span className="text-xs font-bold text-brand-400">500+</span>
            <span className="text-xs text-surface-400">Reports done</span>
          </div>
          <div className="absolute top-1/3 right-4 flex items-center gap-2 rounded-2xl bg-surface-900/70 border border-surface-700/50 px-3.5 py-2 backdrop-blur-sm animate-float float-delay-1 shadow-soft">
            <span className="text-xs text-success-400 font-bold">98%</span>
            <span className="text-xs text-surface-500">Satisfaction</span>
          </div>

          <div className="w-64 h-72">
            <AuthCharacter ref={charRef} />
          </div>
        </div>

        <div className="relative z-10 p-8">
          <p className="text-surface-500 text-sm max-w-xs leading-relaxed">
            Your intelligent lab report workspace, always ready when you are.
          </p>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-12 bg-surface-950 relative">
        {/* Subtle vertical separator */}
        <div className="hidden lg:block absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-surface-700/40 to-transparent" />

        <div ref={cardRef} className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-10 cursor-pointer w-fit">
            <Logo />
            <span className="text-lg font-bold text-white">Quantara</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Sign in</h1>
            <p className="text-surface-400 text-sm">Access your Quantara workspace</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-surface-700 bg-surface-900 hover:bg-surface-800 text-surface-200 text-sm font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 mb-6"
          >
            {googleLoading
              ? <span className="w-5 h-5 rounded-full border-2 border-surface-500 border-t-white animate-spin" />
              : <GoogleIcon />
            }
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-xs text-surface-600 font-medium">or</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); handleTyping(); }}
                  onFocus={() => charRef.current?.setState('email')}
                  onBlur={() => charRef.current?.setState('idle')}
                  placeholder="you@university.edu"
                  autoComplete="email"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-surface-900 border text-surface-100 placeholder:text-surface-600 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${errors.email ? 'border-error-500' : 'border-surface-700 focus:border-brand-500'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-error-400 mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-surface-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); handleTyping(); }}
                  onFocus={() => charRef.current?.setState('password')}
                  onBlur={() => charRef.current?.setState('idle')}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full h-12 pl-10 pr-4 rounded-xl bg-surface-900 border text-surface-100 placeholder:text-surface-600 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${errors.password ? 'border-error-500' : 'border-surface-700 focus:border-brand-500'}`}
                />
              </div>
              {errors.password && <p className="text-xs text-error-400 mt-1">{errors.password}</p>}
              <div className="flex justify-end pt-0.5">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {resetLoading ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-glow mt-2 group"
            >
              {loading
                ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <>Sign in <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-6">
            No account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
