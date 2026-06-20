import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2, Phone, BookOpen } from 'lucide-react';
import Logo from '../components/ui/Logo';
import gsap from 'gsap';
import { useAuth, getDefaultRouteForRole } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
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

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-1.5">
      {children}
    </label>
  );
}

function FieldInput({
  id, type = 'text', value, onChange, onFocus, onBlur,
  placeholder, autoComplete, icon: Icon, error,
}: {
  id: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void; onBlur?: () => void;
  placeholder: string; autoComplete?: string;
  icon: typeof Mail; error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 pointer-events-none" />
        <input
          id={id} type={type} value={value} onChange={onChange}
          onFocus={onFocus} onBlur={onBlur}
          placeholder={placeholder} autoComplete={autoComplete}
          className={`w-full h-11 pl-10 pr-4 rounded-xl bg-surface-900 border text-surface-100 placeholder:text-surface-600 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${error ? 'border-error-500' : 'border-surface-700 focus:border-brand-500'}`}
        />
      </div>
      {error && <p className="text-xs text-error-400 mt-1">{error}</p>}
    </div>
  );
}

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string; email?: string; password?: string; phone?: string; department?: string;
  }>({});

  const { signUp, signInWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
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

  const passwordReqs = [
    { met: password.length >= 6, text: '6+ chars' },
    { met: /[A-Z]/.test(password), text: 'Uppercase' },
    { met: /[0-9]/.test(password), text: 'Number' },
  ];

  const validate = () => {
    const e: typeof errors = {};
    if (!fullName || fullName.length < 2) e.fullName = 'Enter your full name';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password || password.length < 6) e.password = 'Min 6 characters';
    if (!phone || !/^\+?[0-9\s\-]{7,15}$/.test(phone.trim())) e.phone = 'Enter a valid phone';
    if (!department) e.department = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) {
      charRef.current?.setState('error');
      setTimeout(() => charRef.current?.setState('idle'), 1200);
      return;
    }
    setLoading(true);
    charRef.current?.setState('loading');
    const { data, error } = await signUp(email, password, fullName, phone.trim(), department.trim());
    if (error) {
      charRef.current?.setState('error');
      setTimeout(() => charRef.current?.setState('idle'), 1500);
      toast.error('Sign up failed', error.message);
      setLoading(false);
      return;
    }
    if (data && !data.session) {
      charRef.current?.setState('success');
      toast.success('Check your email to verify your account');
      setLoading(false);
      navigate('/login');
      return;
    }
    charRef.current?.setState('success');
    toast.success('Account created!');
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authUser.id).single();
      navigate(getDefaultRouteForRole(profile?.role ?? 'student'));
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) { toast.error('Google sign in failed', error.message); setGoogleLoading(false); }
  };

  const emailFocus = () => charRef.current?.setState('email');
  const passwordFocus = () => charRef.current?.setState('password');
  const blur = () => charRef.current?.setState('idle');

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* ── Left: Character panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(99,102,241,0.12)_0%,transparent_70%)]" />

        <div className="relative z-10 p-8">
          <Link to="/" className="flex items-center gap-3 cursor-pointer w-fit">
            <Logo />
            <span className="text-lg font-bold text-white tracking-tight">Quantara</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute top-6 left-8 flex items-center gap-2 rounded-2xl bg-surface-900/70 border border-surface-700/50 px-3.5 py-2.5 backdrop-blur-sm animate-float shadow-soft">
            <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />
            <span className="text-xs text-surface-200 font-medium">Join 500+ students</span>
          </div>
          <div className="absolute bottom-16 right-6 flex items-center gap-2 rounded-2xl bg-surface-900/70 border border-surface-700/50 px-3.5 py-2.5 backdrop-blur-sm animate-float float-delay-2 shadow-soft">
            <span className="text-xs font-bold text-success-400">98%</span>
            <span className="text-xs text-surface-400">Satisfaction</span>
          </div>

          <div className="w-64 h-72">
            <AuthCharacter ref={charRef} />
          </div>
        </div>

        <div className="relative z-10 p-8">
          <p className="text-surface-500 text-sm max-w-xs leading-relaxed">
            See what's waiting for you on the other side. Your workspace is ready.
          </p>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-8 bg-surface-950 overflow-y-auto relative">
        <div className="hidden lg:block absolute left-0 inset-y-0 w-px bg-gradient-to-b from-transparent via-surface-700/40 to-transparent" />

        <div ref={cardRef} className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-10 cursor-pointer w-fit">
            <Logo />
            <span className="text-lg font-bold text-white">Quantara</span>
          </Link>

          <div className="mb-7">
            <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Create account</h1>
            <p className="text-surface-400 text-sm">Join your Quantara workspace</p>
          </div>

          {/* Google */}
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

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-xs text-surface-600 font-medium">or</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <FieldLabel htmlFor="su-name">Full Name</FieldLabel>
              <FieldInput id="su-name" value={fullName} onChange={(e) => { setFullName(e.target.value); handleTyping(); }} onFocus={emailFocus} onBlur={blur} placeholder="John Doe" autoComplete="name" icon={User} error={errors.fullName} />
            </div>

            <div>
              <FieldLabel htmlFor="su-email">Email</FieldLabel>
              <FieldInput id="su-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); handleTyping(); }} onFocus={emailFocus} onBlur={blur} placeholder="you@university.edu" autoComplete="email" icon={Mail} error={errors.email} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel htmlFor="su-phone">Phone</FieldLabel>
                <FieldInput id="su-phone" type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); handleTyping(); }} onFocus={emailFocus} onBlur={blur} placeholder="+234 800..." icon={Phone} error={errors.phone} />
              </div>
              <div>
                <FieldLabel htmlFor="su-dept">Department</FieldLabel>
                <FieldInput id="su-dept" value={department} onChange={(e) => { setDepartment(e.target.value); handleTyping(); }} onFocus={emailFocus} onBlur={blur} placeholder="Mech. Eng." icon={BookOpen} error={errors.department} />
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="su-password">Password</FieldLabel>
              <FieldInput id="su-password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); handleTyping(); }} onFocus={passwordFocus} onBlur={blur} placeholder="••••••••" autoComplete="new-password" icon={Lock} error={errors.password} />
              {password && (
                <div className="flex gap-3 mt-2">
                  {passwordReqs.map((r) => (
                    <div key={r.text} className={`flex items-center gap-1 text-xs transition-colors ${r.met ? 'text-success-400' : 'text-surface-600'}`}>
                      <CheckCircle2 className={`w-3 h-3 ${r.met ? 'opacity-100' : 'opacity-30'}`} />
                      {r.text}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-60 shadow-glow mt-1 group"
            >
              {loading
                ? <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <>Create account <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-surface-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold cursor-pointer transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
