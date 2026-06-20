import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Clock, Paperclip, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCoursesForUser, useMyRegistrations, useRegisterForCourse, useUnregisterFromCourse } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { DashboardLayout } from '../components/layout';
import { Card, Badge, Button, CourseCardSkeleton, ConfirmModal } from '../components/ui';
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

  const { data: courses, isLoading: coursesLoading } = useCoursesForUser(user?.id);
  const { data: registrations, isLoading: registrationsLoading } = useMyRegistrations(user?.id);
  const registerMutation = useRegisterForCourse();
  const unregisterMutation = useUnregisterFromCourse();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const registeredCourses =
    registrations?.map((r) => ({
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

  const openUnregisterModal = (courseId: string) => {
    setSelectedCourse(courseId);
    setShowUnregisterModal(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Welcome back, {user.full_name.split(' ')[0]}!
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage your slot registrations and browse open courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Slot registrations</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {registeredCourses.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </Card>

          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Open slots</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {availableCourses.filter((c) => c.registration_open && c.remaining_slots > 0).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-950/50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
          </Card>

          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Total Courses</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {courses?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <Logo />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="p-6 border-b border-surface-200 dark:border-surface-800">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Available Courses
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                  Browse open courses and register for service slots
                </p>
              </div>

              <div className="p-6">
                {coursesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CourseCardSkeleton />
                    <CourseCardSkeleton />
                  </div>
                ) : availableCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-surface-300 dark:text-surface-700 mx-auto mb-4" />
                    <p className="text-surface-500 dark:text-surface-400">
                      You're registered for all available courses.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCourses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onRegister={handleRegisterClick}
                        isRegistering={registerMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div>
            <Card padding="none">
              <div className="p-6 border-b border-surface-200 dark:border-surface-800">
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  My Registrations
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                  Your active slot registrations
                </p>
              </div>

              <div className="p-6">
                {registrationsLoading ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse" />
                    <div className="h-16 bg-surface-100 dark:bg-surface-800 rounded-lg animate-pulse" />
                  </div>
                ) : registeredCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-10 h-10 text-surface-300 dark:text-surface-700 mx-auto mb-3" />
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      No registrations yet. Browse available courses to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {registeredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="info" size="sm">
                            {course.code}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openUnregisterModal(course.id)}
                            className="text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/50 -mr-1"
                          >
                            <span className="text-xs">Unregister</span>
                          </Button>
                        </div>
                        <h4 className="text-sm font-medium text-surface-900 dark:text-surface-100 line-clamp-1">
                          {course.title}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-surface-600 dark:text-surface-400">
                          <span className="capitalize">{course.packageType} package</span>
                          <span>{formatNaira(course.amountKobo)}</span>
                          <span className="capitalize">{course.paymentStatus}</span>
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1 line-clamp-1">
                          Delivery: {course.deliveryLocation}
                        </p>
                        <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                          Registered {new Date(course.registeredAt).toLocaleDateString()}
                        </p>
                        {course.outlineUrl && (
                          <a
                            href={course.outlineUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-2 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                          >
                            <Paperclip className="w-3 h-3" />
                            View outline
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showUnregisterModal}
        onClose={() => {
          setShowUnregisterModal(false);
          setSelectedCourse(null);
        }}
        onConfirm={handleUnregister}
        title="Unregister from Course"
        description="Are you sure you want to unregister from this course? Your slot will be made available to other students."
        confirmText="Unregister"
        variant="danger"
        loading={unregisterMutation.isPending}
      />

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
    </DashboardLayout>
  );
}
