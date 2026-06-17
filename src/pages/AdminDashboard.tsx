import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  useAdminStats,
  useAllCourses,
  useDeleteCourse,
} from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { DashboardLayout } from '../components/layout';
import {
  Card,
  Badge,
  Button,
  TableSkeleton,
  ConfirmModal,
  EmptyState,
} from '../components/ui';
import { CourseModal } from '../components/CourseModal';
import type { Course } from '../types/database';
import Logo from "../components/ui/Logo";

export function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: stats } = useAdminStats();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const deleteMutation = useDeleteCourse();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredCourses = courses?.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  const handleDelete = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;

    try {
      await deleteMutation.mutateAsync(courseToDelete.id);
      toast.success('Course deleted successfully');
      setShowDeleteModal(false);
      setCourseToDelete(null);
    } catch (error) {
      toast.error('Failed to delete course', (error as Error).message);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Admin Dashboard
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              Manage courses, slot capacity, and registrations.
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
            Add Course
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Total Students</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/50 flex items-center justify-center">
                <Users className="w-6 h-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </Card>

          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Total Courses</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {stats?.totalCourses || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success-100 dark:bg-success-950/50 flex items-center justify-center">
                <Logo />
              </div>
            </div>
          </Card>

          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Registrations</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {stats?.totalRegistrations || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-warning-100 dark:bg-warning-950/50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-warning-600 dark:text-warning-400" />
              </div>
            </div>
          </Card>

          <Card hover padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">Total Slots</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                  {stats?.totalSlots || 0}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-surface-600 dark:text-surface-400" />
              </div>
            </div>
          </Card>
        </div>

        <Card padding="none">
          <div className="p-6 border-b border-surface-200 dark:border-surface-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Course Management
                </h2>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                  Create courses, set slot limits, and control registration windows
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {coursesLoading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : filteredCourses?.length === 0 ? (
            <EmptyState
              icon={<Logo />}
              title={searchQuery ? 'No courses found' : 'No courses yet'}
              description={
                searchQuery
                  ? 'Try a different search term'
                  : 'Create your first course to get started'
              }
              action={
                !searchQuery && (
                  <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>
                    Add Course
                  </Button>
                )
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 dark:bg-surface-850">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Slots
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-surface-800">
                  {filteredCourses?.map((course) => (
                    <tr
                      key={course.id}
                      className="hover:bg-surface-50 dark:hover:bg-surface-850 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 mb-1">
                            {course.code}
                          </span>
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                            {course.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={course.registration_open ? 'success' : 'error'}>
                          {course.registration_open ? 'Open' : 'Closed'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400">
                        {course.max_slots} slots
                      </td>
                      <td className="px-6 py-4 text-sm text-surface-500 dark:text-surface-400">
                        {new Date(course.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            className="p-2"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(course)}
                            className="p-2 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Modals */}
      <CourseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />

      <CourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        course={selectedCourse}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCourseToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? This action cannot be undone and will remove all associated registrations.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
