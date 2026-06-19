import { useRef, useEffect } from 'react';
import { Users, Calendar, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import type { CourseWithSlots } from '../types/database';
import { Button, Badge } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

interface CourseCardProps {
  course: CourseWithSlots;
  onRegister?: (courseId: string) => void;
  onUnregister?: (courseId: string) => void;
  isRegistering?: boolean;
  isUnregistering?: boolean;
  showActions?: boolean;
  animate?: boolean;
}

export function CourseCard({
  course,
  onRegister,
  onUnregister,
  isRegistering,
  isUnregistering,
  showActions = true,
  animate = true,
}: CourseCardProps) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!animate || !cardRef.current) return;

    gsap.from(cardRef.current, {
      y: 8,
      duration: 0.24,
      ease: 'power2.out',
    });
  }, [animate]);

  const isFull = course.remaining_slots <= 0;
  const canRegister = course.registration_open && !isFull && !course.is_registered;

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: -4,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative p-5 rounded-2xl bg-surface-0 dark:bg-surface-900 border border-surface-200/70 dark:border-surface-800/70 hover:border-brand-300/50 dark:hover:border-brand-700/50 transition-colors duration-200 overflow-hidden cursor-pointer"
      style={{ willChange: 'transform' }}
    >
      <div className="absolute inset-0 bg-brand-500/0 group-hover:bg-brand-500/[0.025] transition-colors duration-200" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <Badge
            variant={course.registration_open ? 'success' : 'error'}
            size="md"
            dot={course.registration_open}
          >
            {course.registration_open ? 'Open' : 'Closed'}
          </Badge>
          {course.is_registered && (
            <Badge variant="gradient" size="md">
              <CheckCircle2 className="w-3 h-3" />
              Registered
            </Badge>
          )}
        </div>

        <div className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 mb-3">
            <Calendar className="w-3.5 h-3.5 text-brand-500" />
            <span className="text-xs font-bold text-surface-600 dark:text-surface-300 uppercase">
              {course.code}
            </span>
          </div>
          <h3 className="text-base font-bold text-surface-900 dark:text-surface-100 mb-2 line-clamp-1">
            {course.title}
          </h3>
          {course.description && (
            <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-5 text-sm text-surface-600 dark:text-surface-300 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-surface-400 dark:text-surface-500">Enrolled</p>
              <p className="font-semibold text-surface-900 dark:text-surface-100">
                {course.registered_count}/{course.max_slots}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-surface-200 dark:text-surface-700"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  r="15"
                  cx="18"
                  cy="18"
                />
                <circle
                  className={`${isFull ? 'text-error-500' : course.remaining_slots <= 5 ? 'text-warning-500' : 'text-success-500'}`}
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  r="15"
                  cx="18"
                  cy="18"
                  strokeDasharray={`${(course.registered_count / course.max_slots) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-xs text-surface-400 dark:text-surface-500">Remaining</p>
              <p className={`font-semibold ${isFull ? 'text-error-600 dark:text-error-400' : course.remaining_slots <= 5 ? 'text-warning-600 dark:text-warning-400' : 'text-surface-900 dark:text-surface-100'}`}>
                {course.remaining_slots} slots
              </p>
            </div>
          </div>
        </div>

        {showActions && user && (
          <div className="pt-5 border-t border-surface-200/60 dark:border-surface-800/60">
            {course.is_registered ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onUnregister?.(course.id)}
                loading={isUnregistering}
              >
                Unregister
              </Button>
            ) : (
              <Button
                className="w-full"
                variant="gradient"
                onClick={() => onRegister?.(course.id)}
                loading={isRegistering}
                disabled={!canRegister}
              >
                {!course.registration_open
                  ? 'Registration Closed'
                  : isFull
                  ? 'No Slots Available'
                  : 'Register Now'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Farouq: 08119818625