import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Play,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Shield,
  LayoutGrid,
  BookOpen,
  ClipboardList,
  UserPlus,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { Button } from '../components/ui';
import { Layout } from '../components/layout';
import Logo from '../components/ui/Logo';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

const features = [
  {
    icon: Calendar,
    title: 'Slot Registration',
    description:
      'Students register for lab report service slots with live capacity checks. No overbooking beyond course limits.',
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-500/25',
  },
  {
    icon: Users,
    title: 'Course Administration',
    description:
      'Admins create courses, set slot capacity, and open or close registrations from one dashboard.',
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/25',
  },
  {
    icon: Clock,
    title: 'Live Availability',
    description:
      'Remaining slots update as registrations change, so students always see current availability.',
    color: 'from-amber-500 to-orange-500',
    shadowColor: 'shadow-amber-500/25',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    description:
      'Separate student and admin experiences with protected routes and row-level security in Supabase.',
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/25',
  },
  {
    icon: LayoutGrid,
    title: 'Registration Tracking',
    description:
      'Students track active registrations. Admins monitor enrollment counts across all courses.',
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'shadow-pink-500/25',
  },
  {
    icon: ClipboardList,
    title: 'Structured Workflow',
    description:
      'Purpose-built for academic lab operations — courses, slots, and registrations in one place.',
    color: 'from-brand-500 to-indigo-500',
    shadowColor: 'shadow-brand-500/25',
  },
];

const pillars = [
  {
    title: 'Students',
    description: 'Browse courses, view remaining slots, register, and track registrations.',
    icon: BookOpen,
  },
  {
    title: 'Administrators',
    description: 'Manage courses, set capacity, control registration windows, and monitor uptake.',
    icon: Shield,
  },
  {
    title: 'Lab operations',
    description: 'Replace spreadsheets and email lists with a single registration workflow.',
    icon: ClipboardList,
  },
  {
    title: 'Secure by design',
    description: 'Authenticated access, protected admin routes, and database policies on every table.',
    icon: CheckCircle2,
  },
];

const steps = [
  {
    number: '01',
    title: 'Create an Account',
    description: 'Sign up with your university email to access the registration platform.',
    icon: UserPlus,
  },
  {
    number: '02',
    title: 'Browse Courses',
    description: 'View open lab courses and check how many service slots remain.',
    icon: BookOpen,
  },
  {
    number: '03',
    title: 'Register for a Slot',
    description: 'Reserve your place when registration is open and capacity is available.',
    icon: CheckCircle2,
  },
];

function AnimatedHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const floatingCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(badgeRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.6,
        delay: 0.2,
        ease: 'power3.out',
      });

      if (titleRef.current) {
        const words = titleRef.current.querySelectorAll('.word');
        gsap.from(words, {
          opacity: 0,
          y: 80,
          rotateX: -90,
          stagger: 0.1,
          duration: 0.8,
          delay: 0.4,
          ease: 'power3.out',
        });
      }

      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.8,
        ease: 'power3.out',
      });

      gsap.from(ctaRef.current?.children || [], {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.6,
        delay: 1,
        ease: 'power3.out',
      });

      gsap.from(visualRef.current, {
        opacity: 0,
        scale: 0.9,
        y: 50,
        duration: 1,
        delay: 0.6,
        ease: 'power3.out',
      });

      if (floatingCardsRef.current) {
        const cards = floatingCardsRef.current.querySelectorAll('.float-card');
        cards.forEach((card, i) => {
          gsap.to(card, {
            y: -15 - i * 5,
            duration: 2 + i * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-brand-radial" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-brand-400/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 mb-8">
              <Logo />
              <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
                Lab report slot registration
              </span>
            </div>

            <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-surface-900 dark:text-surface-100 tracking-tight leading-[1.1] mb-8">
              <span className="word inline-block">Lab Slot</span>
              <br />
              <span className="word inline-block text-gradient-animated">Registration.</span>
              <br />
              <span className="word inline-block">Organized.</span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-lg sm:text-xl text-surface-600 dark:text-surface-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed"
            >
              Quantara manages limited lab report service slots for academic courses. Students
              browse availability and register; administrators control capacity and monitor uptake.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/signup" className="cursor-pointer">
                <Button size="lg" variant="gradient" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right" magnetic>
                  Create account
                </Button>
              </Link>
              <Link to="/courses" className="cursor-pointer">
                <Button size="lg" variant="outline" icon={<Play className="w-5 h-5" />} iconPosition="left">
                  View course catalog
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 mt-10 text-sm text-surface-500 dark:text-surface-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span>Live slot counts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success-500" />
                <span>Student & admin roles</span>
              </div>
            </div>
          </div>

          <div ref={visualRef} className="relative hidden lg:block">
            <div
              ref={floatingCardsRef}
              className="relative w-full aspect-square max-w-lg mx-auto"
            >
              <div className="float-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 rounded-3xl bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-800 shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <Logo />
                  <div>
                    <h4 className="font-bold text-surface-900 dark:text-surface-100">Chemistry Lab</h4>
                    <p className="text-sm text-surface-500">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-2 border-white dark:border-surface-900" />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-success-600 dark:text-success-400">8 slots left</span>
                </div>
              </div>

              <div className="float-card absolute top-4 right-8 p-4 rounded-2xl bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Status</p>
                    <p className="text-sm font-bold text-surface-900 dark:text-surface-100">Registered</p>
                  </div>
                </div>
              </div>

              <div className="float-card absolute bottom-8 left-4 p-4 rounded-2xl bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Duration</p>
                    <p className="text-sm font-bold text-surface-900 dark:text-surface-100">3 hours</p>
                  </div>
                </div>
              </div>

              <div className="float-card absolute bottom-20 right-4 p-4 rounded-2xl bg-surface-0/90 dark:bg-surface-900/90 backdrop-blur-xl border border-surface-200 dark:border-surface-800 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500">Students</p>
                    <p className="text-sm font-bold text-surface-900 dark:text-surface-100">22/30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-surface-300 dark:border-surface-700 flex items-start justify-center p-1">
          <div className="w-1.5 h-3 rounded-full bg-brand-500 animate-scroll" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes scroll {
          0%, 100% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function PillarsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(statsRef.current?.children || [], {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="py-20 border-t border-surface-200 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100 mb-3">
            Built for academic lab operations
          </h2>
          <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
            Quantara V1 focuses on registration management and slot allocation — the core workflow
            labs need before anything else.
          </p>
        </div>
        <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors duration-200 cursor-default"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/50 mb-4">
                <pillar.icon className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('.step-card');
      if (cards) {
        cards.forEach((card, i) => {
          gsap.from(card, {
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
            },
            opacity: 0,
            x: i % 2 === 0 ? -50 : 50,
            duration: 0.8,
            ease: 'power3.out',
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
            Get started in three simple steps. No complex setup required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-300 dark:via-brand-700 to-transparent -translate-y-1/2" />

          {steps.map((step, i) => (
            <div key={i} className="step-card relative">
              <div className="relative p-8 rounded-3xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-500 group hover:shadow-2xl hover:shadow-brand-500/5">
                <div className="absolute -top-4 left-8 px-4 py-1.5 text-sm font-bold bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-full shadow-lg shadow-brand-500/30">
                  {step.number}
                </div>
                <div className="mt-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-950/50 dark:to-brand-900/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <step.icon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current && cardsRef.current.children.length > 0) {
        gsap.fromTo(
          cardsRef.current.children,
          {
            opacity: 0,
            y: 60,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-24 bg-surface-50/50 dark:bg-surface-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
            Registration, slot capacity, and course management for lab report services.
          </p>
        </div>

        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-3xl bg-surface-0 dark:bg-surface-900 border border-surface-200/60 dark:border-surface-800/60 hover:border-brand-300/50 dark:hover:border-brand-700/50 overflow-hidden transition-all duration-500 hover:shadow-2xl"
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${feature.color}`} />

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000" />
              </div>

              <div className="relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-3">
                  {feature.title}
                </h3>
                <p className="text-surface-600 dark:text-surface-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
        opacity: 0,
        y: 40,
        scale: 0.98,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-8 py-20 sm:px-16 sm:py-24">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
          </div>

          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-400/20 rounded-full blur-3xl" />

          <div className="relative text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
              <Logo />
              <span className="text-sm font-medium text-white/90">Academic lab workflow platform</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to manage lab registrations?
            </h2>
            <p className="text-lg text-white/70 mb-10 leading-relaxed">
              Create an account to register for slots, or sign in as an administrator to manage
              courses and capacity.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="cursor-pointer">
                <Button
                  size="lg"
                  className="bg-white text-brand-700 hover:bg-white/90 shadow-2xl shadow-brand-900/30 cursor-pointer"
                  icon={<ArrowRight className="w-5 h-5" />}
                  iconPosition="right"
                >
                  Create account
                </Button>
              </Link>
              <Link to="/courses" className="cursor-pointer">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 cursor-pointer">
                  Browse courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <Layout>
      <AnimatedHero />
      <PillarsSection />
      <HowItWorks />
      <FeaturesGrid />
      <CTASection />
    </Layout>
  );
}
