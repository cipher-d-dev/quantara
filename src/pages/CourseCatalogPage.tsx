import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();
  const [selectedCourseForReg, setSelectedCourseForReg] = useState<Course | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  const { data: courses, isLoading } = useCatalogCourses(user?.id);
  const registerMutation = useRegisterForCourse();
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (!reference || !user) return;

    const verifyPayment = async () => {
      setVerifyingPayment(true);
      try {
        const serverUrl = import.meta.env.VITE_SERVER_URL || '';
        const res = await fetch(`${serverUrl}/api/paystack/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Payment verification failed');
        }

        if (!data.dbRegistered) {
          const { metadata } = data;
          await registerMutation.mutateAsync({
            userId: metadata.userId || user.id,
            courseId: metadata.courseId,
            packageType: metadata.packageType || 'basic',
            deliveryLocation: metadata.deliveryLocation || 'The Engineering Civil Shed',
            paymentReference: reference,
            paymentStatus: 'paid',
            amountKobo: data.amountKobo,
          });
        }

        toast.success('Successfully registered!');
      } catch (error) {
        console.error('Verification error:', error);
        toast.error('Payment verification failed', (error as Error).message);
      } finally {
        setVerifyingPayment(false);
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('reference');
        newParams.delete('trxref');
        setSearchParams(newParams, { replace: true });
      }
    };

    verifyPayment();
  }, [searchParams, user]);

  const filteredCourses = courses?.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegisterClick = (courseId: string) => {
    if (!user) {
      toast.warning('Please sign in to register');
      return;
    }
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

  if (verifyingPayment) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center mx-auto animate-bounce">
            <svg className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">Verifying Payment</h2>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Please wait while we confirm your transaction with Paystack and secure your registration slot...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-surface-100 mb-4">
            Course Catalog
          </h1>
          <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-8">
            Browse lab courses, check remaining slots, and register when registration is open.
          </p>

          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
            <input
              type="text"
              placeholder="Search courses by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
            />
          </div>

          {!user && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800">
              <AlertCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-sm text-brand-700 dark:text-brand-400">
                <Link to="/login" className="font-medium underline cursor-pointer">
                  Sign in
                </Link>{' '}
                to register for courses
              </span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredCourses?.length === 0 ? (
          <EmptyState
            icon={<Logo />}
            title={searchQuery ? 'No courses found' : 'No courses available'}
            description={
              searchQuery
                ? 'Try adjusting your search terms'
                : 'Check back later for new course offerings'
            }
            action={
              searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {user && user.role === 'student' && (
          <div className="mt-12 text-center">
            <Link to="/dashboard">
              <Button variant="outline" icon={<ArrowRight className="w-4 h-4" />} iconPosition="right">
                View My registrations
              </Button>
            </Link>
          </div>
        )}
      </div>

      <RegisterPackageModal
        isOpen={isPackageModalOpen}
        onClose={() => {
          setIsPackageModalOpen(false);
          setSelectedCourseForReg(null);
        }}
        course={selectedCourseForReg}
        onRegisterComplete={handleRegisterComplete}
        isRegistering={registerMutation.isPending}
      />
    </Layout>
  );
}
