import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Search } from 'lucide-react';
import gsap from 'gsap';
import { useCatalogCourses, useRegisterForCourse } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Layout } from '../components/layout';
import { CourseCard } from '../components/CourseCard';
import { Button, CourseCardSkeleton, EmptyState } from '../components/ui';
import Logo from '../components/ui/Logo';
import { RegisterPackageModal } from '../components/RegisterPackageModal';
import type { Course } from '../types/database';

export function CourseCatalogPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseForReg, setSelectedCourseForReg] = useState<Course | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { data: courses, isLoading } = useCatalogCourses(user?.id);
  const registerMutation = useRegisterForCourse();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { y: 20, opacity: 0, duration: 0.7, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!isLoading && gridRef.current?.children.length) {
      gsap.from(Array.from(gridRef.current.children), {
        y: 16, opacity: 0, duration: 0.4, ease: 'power3.out', stagger: 0.06,
      });
    }
  }, [isLoading]);

  const filteredCourses = courses?.filter(
    (c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterClick = (courseId: string) => {
    if (!user) { toast.warning('Please sign in to register'); return; }
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

  return (
    <Layout>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(99,102,241,0.1)_0%,transparent_65%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Hero */}
          <div ref={heroRef} className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-50 tracking-tight mb-4">
              Course Catalog
            </h1>
            <p className="text-surface-500 dark:text-surface-400 max-w-xl mx-auto mb-8 leading-relaxed">
              Browse lab courses, check remaining slots, and register when registration is open.
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search by course code or name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors shadow-soft"
              />
            </div>

            {/* Guest notice */}
            {!user && (
              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-sm text-brand-400">
                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  <Link to="/login" className="font-semibold underline hover:text-brand-300 transition-colors cursor-pointer">
                    Sign in
                  </Link>{' '}
                  to register for courses
                </span>
              </div>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : filteredCourses?.length === 0 ? (
            <EmptyState
              icon={<Logo />}
              title={searchQuery ? 'No courses found' : 'No courses available'}
              description={searchQuery ? 'Try adjusting your search' : 'Check back later for new course offerings'}
              action={searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>Clear search</Button>
              )}
            />
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses?.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onRegister={handleRegisterClick}
                  isRegistering={registerMutation.isPending}
                  showActions={!!user}
                />
              ))}
            </div>
          )}

          {/* Link to dashboard */}
          {user?.role === 'student' && (
            <div className="mt-12 text-center">
              <Link to="/dashboard">
                <Button variant="outline" icon={<ArrowRight className="w-4 h-4" aria-hidden="true" />} iconPosition="right">
                  View my registrations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <RegisterPackageModal
        isOpen={isPackageModalOpen}
        onClose={() => { setIsPackageModalOpen(false); setSelectedCourseForReg(null); }}
        course={selectedCourseForReg}
        onRegisterComplete={handleRegisterComplete}
        isRegistering={registerMutation.isPending}
      />
    </Layout>
  );
}
