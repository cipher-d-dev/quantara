import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Calendar, Paperclip, Pencil, Plus, Search, Shield, Trash2, TrendingUp, Users } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { useAdminStats, useAllCourses, useAllRegistrations, useDeleteCourse } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import { DashboardLayout } from '../components/layout';
import { Badge, Button, ConfirmModal, EmptyState, Modal, TableSkeleton } from '../components/ui';
import { CourseModal } from '../components/CourseModal';
import Logo from '../components/ui/Logo';
import type { Course } from '../types/database';
import { formatNaira } from '../lib/packages';

export function AdminDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [registrationsCourse, setRegistrationsCourse] = useState<Course | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const { data: stats } = useAdminStats();
  const { data: courses, isLoading: coursesLoading } = useAllCourses();
  const { data: allRegistrations, isLoading: registrationsLoading } = useAllRegistrations();
  const deleteMutation = useDeleteCourse();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(heroRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(statsRef.current?.children ?? [], { y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.08, delay: 0.2 });
      gsap.from(tableRef.current, { y: 20, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.45 });
    });
    return () => ctx.revert();
  }, []);

  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const filteredCourses = courses?.filter(
    (c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const courseRegistrations = allRegistrations?.filter(
    (r) => r.course.id === registrationsCourse?.id
  ) || [];

  const handleEdit = (course: Course) => { setSelectedCourse(course); setShowEditModal(true); };
  const handleDelete = (course: Course) => { setCourseToDelete(course); setShowDeleteModal(true); };

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

  const statCards = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'brand' },
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: Logo, color: 'surface', isLogo: true },
    { label: 'Registrations', value: stats?.totalRegistrations || 0, icon: Calendar, color: 'warning' },
    { label: 'Total Slots', value: stats?.totalSlots || 0, icon: TrendingUp, color: 'success' },
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(99,102,241,0.08)_0%,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div ref={heroRef} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
                <Shield className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-surface-500 mt-0.5">Manage courses, payments, and registrations.</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              icon={<Plus className="w-4 h-4" aria-hidden="true" />}
              className="shadow-glow"
            >
              Add Course
            </Button>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map(({ label, value, icon: Icon, color, isLogo }) => (
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
                    color === 'warning' ? 'bg-warning-100 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400' :
                    color === 'success' ? 'bg-success-100 dark:bg-success-500/10 text-success-600 dark:text-success-400' :
                    'bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400'
                  }`}>
                    {isLogo ? <Logo size={28} /> : <Icon className="w-5 h-5" aria-hidden="true" />}
                  </div>
                </div>
                <div className={`absolute inset-x-0 bottom-0 h-px ${
                  color === 'brand' ? 'bg-gradient-to-r from-transparent via-brand-500/40 to-transparent' :
                  color === 'warning' ? 'bg-gradient-to-r from-transparent via-warning-500/40 to-transparent' :
                  color === 'success' ? 'bg-gradient-to-r from-transparent via-success-500/40 to-transparent' :
                  'bg-gradient-to-r from-transparent via-surface-300/60 dark:via-surface-700/40 to-transparent'
                }`} />
              </div>
            ))}
          </div>

          {/* Course management table */}
          <div ref={tableRef} className="rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/60 shadow-soft overflow-hidden">
            <div className="px-6 py-5 border-b border-surface-200 dark:border-surface-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-surface-900 dark:text-surface-100">Course Management</h2>
                <p className="text-xs text-surface-500 mt-1">Open a course to view students and payment details.</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-60 h-10 pl-10 pr-4 rounded-xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 dark:placeholder:text-surface-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {coursesLoading ? (
              <div className="p-6"><TableSkeleton rows={5} /></div>
            ) : filteredCourses?.length === 0 ? (
              <EmptyState
                icon={<Logo />}
                title={searchQuery ? 'No courses found' : 'No courses yet'}
                description={searchQuery ? 'Try a different search term' : 'Create your first course to get started'}
                action={!searchQuery && (
                  <Button onClick={() => setShowCreateModal(true)} icon={<Plus className="w-4 h-4" />}>Add Course</Button>
                )}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface-50 dark:bg-surface-900/80 border-b border-surface-200 dark:border-surface-800/60">
                    <tr>
                      {['Course', 'Status', 'Slots', 'Created', 'Actions'].map((h, i) => (
                        <th key={h} className={`px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200 dark:divide-surface-800/40">
                    {filteredCourses?.map((course) => (
                      <tr key={course.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/30 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-lg bg-brand-100 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 mb-1">
                            {course.code}
                          </span>
                          <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{course.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={course.registration_open ? 'success' : 'error'}>
                            {course.registration_open ? 'Open' : 'Closed'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-surface-400">{course.max_slots} slots</td>
                        <td className="px-6 py-4 text-sm text-surface-500">
                          {new Date(course.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => setRegistrationsCourse(course)}
                              className="p-2 text-brand-400 hover:bg-brand-500/10"
                              aria-label={`View registrations for ${course.title}`}
                              title="View registrations"
                            >
                              <Users className="w-4 h-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleEdit(course)}
                              className="p-2 text-surface-400 hover:bg-surface-700/40"
                              aria-label={`Edit ${course.title}`}
                              title="Edit course"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => handleDelete(course)}
                              className="p-2 text-error-500 hover:bg-error-500/10"
                              aria-label={`Delete ${course.title}`}
                              title="Delete course"
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <CourseModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
      <CourseModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedCourse(null); }}
        course={selectedCourse}
      />
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setCourseToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToDelete?.title}"? This cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />

      {/* Registrations modal */}
      <Modal
        isOpen={!!registrationsCourse}
        onClose={() => setRegistrationsCourse(null)}
        title={`Registrations: ${registrationsCourse?.code ?? ''}`}
        description={`Students registered for ${registrationsCourse?.title ?? 'this course'}`}
        size="xl"
      >
        {registrationsLoading ? (
          <TableSkeleton rows={4} />
        ) : courseRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-surface-700 mx-auto mb-4" aria-hidden="true" />
            <p className="text-surface-500">No students registered yet for this course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto pr-1">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800 text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase">
                  <th className="pb-3 pr-4">Student</th>
                  <th className="pb-3 px-4">Package</th>
                  <th className="pb-3 px-4">Delivery</th>
                  <th className="pb-3 px-4">Payment</th>
                  <th className="pb-3 px-4">Lab Guidelines</th>
                  <th className="pb-3 pl-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200 dark:divide-surface-800 text-sm">
                {courseRegistrations.map((registration) => (
                  <tr key={registration.id} className="text-surface-900 dark:text-surface-100">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{registration.user?.full_name || 'Unknown User'}</p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">{registration.user?.email || 'No email'}</p>
                      {registration.user?.phone && (
                        <p className="text-xs text-surface-500 dark:text-surface-400">{registration.user.phone}</p>
                      )}
                      {registration.user?.department && (
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium">{registration.user.department}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={registration.package_type === 'pro' ? 'info' : 'default'}>
                        {registration.package_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs text-surface-600 dark:text-surface-400 max-w-[180px]" title={registration.delivery_location}>
                      <p className="truncate">{registration.delivery_location}</p>
                      {registration.delivery_time && (
                        <p className="text-[10px] text-brand-600 dark:text-brand-400 mt-0.5">
                          {new Date(registration.delivery_time).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-xs">{formatNaira(registration.amount_kobo)}</p>
                      <p className="text-[10px] capitalize text-surface-500 dark:text-surface-400">{registration.payment_status}</p>
                      <p className="text-[10px] text-surface-500 dark:text-surface-400 truncate max-w-[120px]" title={registration.payment_reference || ''}>
                        Ref: {registration.payment_reference || 'N/A'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {registration.outline_url ? (
                        <div className="flex flex-col items-start gap-1.5">
                          <a
                            href={registration.outline_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                            title="View lab guidelines"
                          >
                            <Paperclip className="w-3 h-3" aria-hidden="true" />
                            View
                          </a>
                          <button
                            type="button"
                            title="Download lab guidelines"
                            className="text-xs text-surface-500 dark:text-surface-400 hover:text-surface-200 cursor-pointer transition-colors"
                            onClick={async () => {
                              try {
                                const res = await fetch(registration.outline_url!);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                const ext = registration.outline_url!.split('.').pop()?.split('?')[0] ?? 'pdf';
                                a.download = `outline-${registration.id}.${ext}`;
                                a.click();
                                URL.revokeObjectURL(url);
                              } catch {
                                window.open(registration.outline_url!, '_blank');
                              }
                            }}
                          >
                            ↓ Download
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-surface-400 dark:text-surface-600">—</span>
                      )}
                    </td>
                    <td className="py-3 pl-4 text-right text-xs text-surface-500 dark:text-surface-400">
                      {new Date(registration.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
