import { InputHTMLAttributes, forwardRef } from 'react';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const toggleId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        htmlFor={toggleId}
        className={`flex items-center gap-3 cursor-pointer ${className}`}
      >
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={toggleId}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`
              w-10 h-6 rounded-full transition-all duration-200 ease-out
              bg-surface-300 dark:bg-surface-700
              peer-checked:bg-brand-600 dark:peer-checked:bg-brand-500
              peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2
              after:content-[''] after:absolute after:top-0.5 after:left-0.5
              after:w-5 after:h-5 after:rounded-full after:bg-white
              after:transition-all after:duration-200 after:ease-out
              after:shadow-sm
              peer-checked:after:translate-x-4
            `}
          />
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                {label}
              </p>
            )}
            {description && (
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
