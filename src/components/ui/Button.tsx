import { ButtonHTMLAttributes, forwardRef, useRef, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  magnetic?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:shadow-md hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-600',
  secondary:
    'bg-surface-100 text-surface-900 hover:bg-surface-200 active:bg-surface-300 dark:bg-surface-800/80 dark:text-surface-100 dark:hover:bg-surface-700',
  ghost:
    'bg-transparent text-surface-700 hover:bg-surface-100 hover:text-surface-950 active:bg-surface-200 dark:text-surface-200 dark:hover:bg-surface-800 dark:hover:text-white',
  danger:
    'bg-error-600 text-white shadow-sm hover:shadow-md hover:bg-error-700 active:bg-error-800',
  outline:
    'border border-surface-200 bg-transparent text-surface-800 hover:bg-surface-50 hover:border-surface-300 dark:border-surface-700 dark:text-surface-100 dark:hover:bg-surface-800/50 dark:hover:border-surface-600',
  gradient:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm hover:shadow-md hover:from-brand-700 hover:to-brand-600 active:from-brand-800 active:to-brand-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm gap-2 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2.5 rounded-xl',
  lg: 'h-13 px-7 text-base gap-3 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      magnetic = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      if (!magnetic) return;
      const button = buttonRef.current;
      if (!button) return;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = button.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) / 5;
        const deltaY = (e.clientY - centerY) / 5;
        setPosition({ x: deltaX, y: deltaY });
      };

      const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
      };

      button.addEventListener('mousemove', handleMouseMove);
      button.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        button.removeEventListener('mousemove', handleMouseMove);
        button.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [magnetic]);

    const transform = magnetic
      ? `translate(${position.x}px, ${position.y}px)`
      : undefined;

    return (
      <button
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        className={`
          relative inline-flex items-center justify-center font-semibold
          transition-colors duration-200 ease-out
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-surface-950
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          cursor-pointer
          overflow-hidden group
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
        style={{ transform }}
        disabled={disabled || loading}
        {...props}
      >
        <span className="relative inline-flex items-center justify-center gap-inherit">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {!loading && icon && iconPosition === 'left' && (
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              {icon}
            </span>
          )}
          {children}
          {!loading && icon && iconPosition === 'right' && (
            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
              {icon}
            </span>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';
