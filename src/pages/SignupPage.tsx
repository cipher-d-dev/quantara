import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { useAuth, getDefaultRouteForRole } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { Button, Input, Card } from '../components/ui';
import { Layout } from '../components/layout';
import Logo from '../components/ui/Logo';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});

  const { signUp, signInWithGoogle } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.from(cardRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.98,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const passwordRequirements = [
    { met: password.length >= 6, text: 'At least 6 characters' },
    { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(password), text: 'One number' },
  ];

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      toast.error('Sign up failed', error.message);
      setLoading(false);
      return;
    }

    toast.success('Account created successfully!');
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();
      navigate(getDefaultRouteForRole(profile?.role ?? 'student'));
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      toast.error('Google sign in failed', error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <Layout showFooter={false}>
      <div ref={containerRef} className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 gradient-mesh">
        <div className="w-full max-w-md" ref={cardRef}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-8 group cursor-pointer">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 flex items-center justify-center shadow-xl shadow-brand-500/30 group-hover:shadow-2xl group-hover:shadow-brand-500/40 transition-all duration-300 group-hover:scale-105">
                <Logo />
              </div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-2">
              Create your account
            </h1>
            <p className="text-surface-500 dark:text-surface-400">
              Create your account to register for lab report service slots
            </p>
          </div>

          <Card padding="lg" className="shadow-2xl border-surface-200/60 dark:border-surface-800/60">
            <div className="space-y-6">
              <Button
                variant="outline"
                className="w-full h-12 gap-3 cursor-pointer"
                onClick={handleGoogleSignIn}
                loading={googleLoading}
                icon={!googleLoading ? <GoogleIcon /> : undefined}
              >
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-200 dark:border-surface-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-surface-0 dark:bg-surface-900 text-surface-400 dark:text-surface-500 font-medium">
                    or create account with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  icon={<User className="w-5 h-5" />}
                  error={errors.fullName}
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  icon={<Mail className="w-5 h-5" />}
                  error={errors.email}
                />

                <div>
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    icon={<Lock className="w-5 h-5" />}
                    error={errors.password}
                  />
                  {password && (
                    <div className="mt-4 space-y-2">
                      {passwordRequirements.map((req, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${
                            req.met
                              ? 'text-success-600 dark:text-success-400'
                              : 'text-surface-400 dark:text-surface-500'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                            req.met ? 'bg-success-100 dark:bg-success-950' : 'bg-surface-100 dark:bg-surface-800'
                          }`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 transition-all duration-300 ${
                              req.met ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                            }`} />
                          </div>
                          <span>{req.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
                    Student accounts are used to browse courses, view remaining slots, and register
                    for lab report services.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 cursor-pointer"
                  variant="gradient"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                  loading={loading}
                >
                  Create account
                </Button>
              </form>
            </div>

            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800 text-center">
              <p className="text-sm text-surface-500 dark:text-surface-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
