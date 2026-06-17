import { forwardRef } from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles = {
  default:
    'bg-surface-100/80 text-surface-700 dark:bg-surface-800/80 dark:text-surface-300 backdrop-blur-sm',
  success:
    'bg-success-100/80 text-success-700 dark:bg-success-950/50 dark:text-success-400 backdrop-blur-sm',
  warning:
    'bg-warning-100/80 text-warning-700 dark:bg-warning-950/50 dark:text-warning-400 backdrop-blur-sm',
  error:
    'bg-error-100/80 text-error-700 dark:bg-error-950/50 dark:text-error-400 backdrop-blur-sm',
  info:
    'bg-brand-100/80 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400 backdrop-blur-sm',
  gradient:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm shadow-brand-500/20',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

const dotColors = {
  default: 'bg-surface-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
  info: 'bg-brand-500',
  gradient: 'bg-white',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'sm', dot = false, className = '' }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-semibold rounded-full gap-1.5
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
      >
        {dot && (
          <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
