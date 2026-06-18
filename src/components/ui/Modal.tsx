import { Fragment, ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !modalRef.current) return;

    if (isOpen) {
      // Open animation
      gsap.set(overlayRef.current, { opacity: 0 });
      gsap.set(modalRef.current, { opacity: 0, scale: 0.95, y: 20 });

      const tl = gsap.timeline();

      tl.to(overlayRef.current, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });

      tl.to(
        modalRef.current,
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: 'power3.out',
        },
        '-=0.1'
      );
    } else {
      // Close animation
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });

      gsap.to(modalRef.current, {
        opacity: 0,
        scale: 0.95,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
      });
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Fragment>
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-surface-950/60 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          className={`
            w-full ${sizeStyles[size]} pointer-events-auto
            bg-surface-0 dark:bg-surface-900
            rounded-2xl shadow-xl shadow-surface-950/10 dark:shadow-surface-950/40
            border border-surface-200/80 dark:border-surface-800/80
            overflow-hidden
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || description) && (
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                {title && (
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-1.5">
                    {description}
                  </p>
                )}
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 -mr-2 -mt-1 rounded-xl text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Fragment>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm">
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
