import { HTMLAttributes, forwardRef, useRef, useEffect } from 'react';
import gsap from 'gsap';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glass?: boolean;
  animated?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, hover = false, padding = 'md', glass = false, animated = false, className = '', onMouseEnter, onMouseLeave, ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const internalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!animated) return;
      const card = cardRef.current;
      if (!card) return;

      gsap.fromTo(
        card,
        { opacity: 0, y: 20, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power3.out',
        }
      );
    }, [animated]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!hover || !cardRef.current) return;

      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(e);
    };

    return (
      <div
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          (internalRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`
          relative rounded-2xl border overflow-hidden
          ${glass
            ? 'glass'
            : 'bg-surface-0 dark:bg-surface-900 border-surface-200/60 dark:border-surface-800/60'
          }
          ${hover
            ? 'transition-colors duration-200 hover:border-brand-300/40 dark:hover:border-brand-700/40'
            : 'shadow-sm'
          }
          ${paddingStyles[padding]}
          ${className}
        `}
        style={{
          '--mouse-x': '0px',
          '--mouse-y': '0px',
        } as React.CSSProperties}
        onMouseEnter={onMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Subtle pointer wash for dense admin surfaces. */}
        {hover && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"
            style={{
              background: `radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(99, 102, 241, 0.15), transparent 40%)`,
            }}
          />
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export function CardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`mb-5 ${className}`}>{children}</div>;
}

export function CardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={`text-xl font-bold text-surface-900 dark:text-surface-100 tracking-tight ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-surface-500 dark:text-surface-400 mt-1.5 leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mt-5 pt-5 border-t border-surface-200/60 dark:border-surface-800/60 ${className}`}>
      {children}
    </div>
  );
}
