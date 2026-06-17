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
    'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-600/30 hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:shadow-brand-500/20 dark:hover:bg-brand-600',
  secondary:
    'bg-surface-100 text-surface-900 hover:bg-surface-200 active:bg-surface-300 dark:bg-surface-800/80 dark:text-surface-100 dark:hover:bg-surface-700 shadow-sm hover:shadow-md',
  ghost:
    'bg-transparent text-surface-600 hover:bg-surface-100 hover:text-surface-900 active:bg-surface-200 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100',
  danger:
    'bg-error-600 text-white shadow-lg shadow-error-600/25 hover:shadow-xl hover:shadow-error-600/30 hover:bg-error-700 active:bg-error-800',
  outline:
    'border-2 border-surface-200 bg-transparent text-surface-700 hover:bg-surface-50 hover:border-surface-300 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800/50 dark:hover:border-surface-600',
  gradient:
    'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg shadow-brand-600/25 hover:shadow-xl hover:shadow-brand-500/30 hover:from-brand-700 hover:to-brand-600 active:from-brand-800 active:to-brand-700',
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
          transition-all duration-300 ease-out
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
        {/* Shine effect for gradient variant */}
        {variant === 'gradient' && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
        )}

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
