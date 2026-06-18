import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, ArrowRight } from 'lucide-react';
import { useCatalogCourses, useRegisterForCourse } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Layout } from '../components/layout';
import { CourseCard } from '../components/CourseCard';
import { Button, CourseCardSkeleton, EmptyState } from '../components/ui';
import Logo from '../components/ui/Logo';

export function CourseCatalogPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  const { data: courses, isLoading } = useCatalogCourses(user?.id);
  const registerMutation = useRegisterForCourse();

  const filteredCourses = courses?.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = async (courseId: string) => {
    if (!user) {
      toast.warning('Please sign in to register');
      return;
    }

    try {
      await registerMutation.mutateAsync({ userId: user.id, courseId });
      toast.success('Successfully registered!');
    } catch (error) {
      toast.error('Registration failed', (error as Error).message);
    }
  };

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
                onRegister={handleRegister}
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
    </Layout>
  );
}
