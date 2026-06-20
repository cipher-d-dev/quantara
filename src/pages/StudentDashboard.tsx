import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Clock, Paperclip, TrendingUp, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { useCoursesForUser, useMyRegistrations, useRegisterForCourse, useUnregisterFromCourse } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { DashboardLayout } from '../components/layout';
import { Badge, Button, CourseCardSkeleton, ConfirmModal } from '../components/ui';
import { CourseCard } from '../components/CourseCard';
import Logo from '../components/ui/Logo';
import { RegisterPackageModal } from '../components/RegisterPackageModal';
import type { Course } from '../types/database';
import { formatNaira } from '../lib/packages';

export function StudentDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [selectedCourseForReg, setSelectedCourseForReg] = useState<Course | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: courses, isLoading: coursesLoading } = useCoursesForUser(user?.id);
  const { data: registrations, isLoading: registrationsLoading } = useMyRegistrations(user?.id);
  const registerMutation = useRegisterForCourse();
  const unregisterMutation = useUnregisterFromCourse();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(statsRef.current?.children ?? [], { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 0.2 });
      gsap.from(contentRef.current?.children ?? [], { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1, delay: 0.4 });
    });
    return () => ctx.revert();
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const registeredCourses = registrations?.map((r) => ({
    ...r.course,
    registrationId: r.id,
    packageType: r.package_type,
    deliveryLocation: r.delivery_location,
    amountKobo: r.amount_kobo,
    paymentStatus: r.payment_status,
    registeredAt: r.created_at,
    outlineUrl: r.outline_url,
  })) || [];

  const availableCourses = courses?.filter((c) => !c.is_registered) || [];

  const handleRegisterClick = (courseId: string) => {
    const course = courses?.find((c) => c.id === courseId);
    if (!course) return;
    setSelectedCourseForReg(course);
    setIsPackageModalOpen(true);
  };

  const handleRegisterComplete = async (params: {
    packageType: 'basic' | 'pro';
    deliveryLocation: string;
    paymentReference: string;
    amountKobo: number;
  }) => {
    if (!selectedCourseForReg || !user) return;
    try {
      await registerMutation.mutateAsync({
        userId: user.id,
        courseId: selectedCourseForReg.id,
        packageType: params.packageType,
        deliveryLocation: params.deliveryLocation,
        paymentReference: params.paymentReference,
        paymentStatus: 'paid',
        amountKobo: params.amountKobo,
      });
      toast.success('Successfully registered!');
    } catch (error) {
      toast.error('Registration failed', (error as Error).message);
      throw error;
    }
  };

  const handleUnregister = async () => {
    if (!selectedCourse) return;
    const registration = registrations?.find((r) => r.course.id === selectedCourse);
    if (!registration) return;
    try {
      await unregisterMutation.mutateAsync(registration.id);
      toast.success('Successfully unregistered');
      setShowUnregisterModal(false);
      setSelectedCourse(null);
    } catch (error) {
      toast.error('Failed to unregister', (error as Error).message);
    }
  };

  const stats = [
    { label: 'My Registrations', value: registeredCourses.length, icon: Calendar, color: 'brand' },
    { label: 'Open Slots', value: availableCourses.filter((c) => c.registration_open && c.remaining_slots > 0).length, icon: TrendingUp, color: 'success' },
    { label: 'Total Courses', value: courses?.length || 0, icon: BookOpen, color: 'surface' },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(99,102,241,0.06)_0%,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Hero greeting */}
          <div ref={heroRef} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
                <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">
                  Welcome back, {user.full_name.split(' ')[0]}
                </h1>
                <p className="text-sm text-surface-500 mt-0.5">
                  Manage your registrations and browse open courses.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="relative overflow-hidden rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/60 p-5 hover:border-surface-300 dark:hover:border-surface-700/80 transition-colors duration-200 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-3xl font-bold text-surface-900 dark:text-surface-50">{value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    color === 'brand' ? 'bg-brand-100 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400' :
                    color === 'success' ? 'bg-success-100 dark:bg-success-500/10 text-success-600 dark:text-success-400' :
                    'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'
                  }`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                </div>
                <div className={`absolute inset-x-0 bottom-0 h-px ${
                  color === 'brand' ? 'bg-gradient-to-r from-transparent via-brand-500/40 to-transparent' :
                  color === 'success' ? 'bg-gradient-to-r from-transparent via-success-500/40 to-transparent' :
                  'bg-gradient-to-r from-transparent via-surface-300/60 dark:via-surface-700/40 to-transparent'
                }`} />
              </div>
            ))}
          </div>

          {/* Main content */}
          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Available Courses */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/60 shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800/60">
                  <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">Available Courses</h2>
                  <p className="text-xs text-surface-500 mt-1">Browse open courses and register for service slots</p>
                </div>
                <div className="p-6">
                  {coursesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CourseCardSkeleton /><CourseCardSkeleton />
                    </div>
                  ) : availableCourses.length === 0 ? (
                    <div className="text-center py-14">
                      <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800/60 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-6 h-6 text-surface-400 dark:text-surface-600" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-surface-500">You're registered for all available courses.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableCourses.map((course) => (
                        <CourseCard key={course.id} course={course} onRegister={handleRegisterClick} isRegistering={registerMutation.isPending} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* My Registrations */}
            <div>
              <div className="rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/60 shadow-soft overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800/60">
                  <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">My Registrations</h2>
                  <p className="text-xs text-surface-500 mt-1">Your active slot registrations</p>
                </div>
                <div className="p-4">
                  {registrationsLoading ? (
                    <div className="space-y-3">
                      <div className="h-20 bg-surface-100 dark:bg-surface-800/40 rounded-xl animate-pulse" />
                      <div className="h-20 bg-surface-100 dark:bg-surface-800/40 rounded-xl animate-pulse" />
                    </div>
                  ) : registeredCourses.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800/60 flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-5 h-5 text-surface-400 dark:text-surface-600" aria-hidden="true" />
                      </div>
                      <p className="text-xs text-surface-500">No registrations yet. Browse available courses to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {registeredCourses.map((course) => (
                        <div key={course.id} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/40 hover:border-brand-300 dark:hover:border-brand-500/30 transition-colors duration-200">
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="info" size="sm">{course.code}</Badge>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCourse(course.id); setShowUnregisterModal(true); }} className="text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 -mr-1 -mt-1 text-xs">
                              Unregister
                            </Button>
                          </div>
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100 line-clamp-1 mb-2">{course.title}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-surface-500">
                            <span className="capitalize">{course.packageType}</span>
                            <span>{formatNaira(course.amountKobo)}</span>
                            <span className={`capitalize font-medium ${course.paymentStatus === 'paid' ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400'}`}>
                              {course.paymentStatus}
                            </span>
                          </div>
                          <p className="text-xs text-surface-500 mt-1 truncate">{course.deliveryLocation}</p>
                          {course.outlineUrl && (
                            <a href={course.outlineUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline transition-colors">
                              <Paperclip className="w-3 h-3" aria-hidden="true" />
                              View guidelines
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal isOpen={showUnregisterModal} onClose={() => { setShowUnregisterModal(false); setSelectedCourse(null); }} onConfirm={handleUnregister} title="Unregister from Course" description="Are you sure you want to unregister? Your slot will be made available to other students." confirmText="Unregister" variant="danger" loading={unregisterMutation.isPending} />
      <RegisterPackageModal isOpen={isPackageModalOpen} onClose={() => { setIsPackageModalOpen(false); setSelectedCourseForReg(null); }} course={selectedCourseForReg} onRegisterComplete={handleRegisterComplete} isRegistering={registerMutation.isPending} />
    </DashboardLayout>
  );
}
