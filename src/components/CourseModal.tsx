import { useEffect, useState } from 'react';
import { Input, Button, Toggle, Modal } from '../components/ui';
import { useCreateCourse, useUpdateCourse } from '../hooks';
import { useToast } from '../contexts/ToastContext';
import type { Course } from '../types/database';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
}

export function CourseModal({ isOpen, onClose, course }: CourseModalProps) {
  const [code, setCode] = useState(course?.code || '');
  const [title, setTitle] = useState(course?.title || '');
  const [description, setDescription] = useState(course?.description || '');
  const [maxSlots, setMaxSlots] = useState(course?.max_slots?.toString() || '30');
  const [registrationOpen, setRegistrationOpen] = useState(course?.registration_open ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const toast = useToast();

  const isEditing = !!course;

  useEffect(() => {
    if (!isOpen) return;

    setCode(course?.code || '');
    setTitle(course?.title || '');
    setDescription(course?.description || '');
    setMaxSlots(course?.max_slots?.toString() || '30');
    setRegistrationOpen(course?.registration_open ?? true);
    setErrors({});
  }, [course, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) newErrors.code = 'Course code is required';
    if (!title.trim()) newErrors.title = 'Course title is required';
    if (!maxSlots || parseInt(maxSlots) < 1) newErrors.maxSlots = 'Must be at least 1 slot';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const courseData = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim() || null,
        max_slots: parseInt(maxSlots),
        registration_open: registrationOpen,
      };

      if (isEditing) {
        await updateCourse.mutateAsync({ id: course.id, updates: courseData });
        toast.success('Course updated successfully');
      } else {
        await createCourse.mutateAsync(courseData);
        toast.success('Course created successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save course', (error as Error).message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Course' : 'Create New Course'}
      description={isEditing ? 'Update course details and settings.' : 'Add a new course to the catalog.'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Course Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="CHEM101"
            error={errors.code}
          />
          <Input
            label="Max Slots"
            type="number"
            min="1"
            value={maxSlots}
            onChange={(e) => setMaxSlots(e.target.value)}
            error={errors.maxSlots}
          />
        </div>

        <Input
          label="Course Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Introduction to Chemistry"
          error={errors.title}
        />

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the course..."
            rows={3}
            className="w-full min-h-24 px-3.5 py-2.5 rounded-xl bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-colors"
          />
        </div>

        <Toggle
          label="Open for Registration"
          description="Allow students to register for this course"
          checked={registrationOpen}
          onChange={(e) => setRegistrationOpen(e.target.checked)}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-surface-200 dark:border-surface-800">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createCourse.isPending || updateCourse.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
