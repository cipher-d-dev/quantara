import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, success, hint, icon, className = '', id, onFocus, onBlur, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
              isFocused
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-surface-700 dark:text-surface-300'
            }`}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                isFocused
                  ? 'text-brand-500 dark:text-brand-400'
                  : 'text-surface-400 dark:text-surface-500'
              }`}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-12 px-4 rounded-xl
              bg-surface-50 dark:bg-surface-900/50
              border-2
              ${error
                ? 'border-error-400 dark:border-error-500 focus:border-error-500 dark:focus:border-error-400'
                : isFocused
                  ? 'border-brand-500 dark:border-brand-400'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              }
              text-surface-900 dark:text-surface-100
              placeholder:text-surface-400 dark:placeholder:text-surface-500
              transition-all duration-300 ease-out
              focus:outline-none
              focus:bg-surface-0 dark:focus:bg-surface-900
              ${error ? 'focus:ring-4 focus:ring-error-500/10 dark:focus:ring-error-500/20' : 'focus:ring-4 focus:ring-brand-500/10 dark:focus:ring-brand-500/20'}
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-12' : ''}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-error-500 animate-scale-in" />
            </div>
          )}
          {success && !error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle2 className="w-5 h-5 text-success-500 animate-scale-in" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center gap-1.5 animate-slide-down">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}
        {success && !error && (
          <p className="mt-2 text-sm text-success-600 dark:text-success-400 flex items-center gap-1.5 animate-slide-down">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {success}
          </p>
        )}
        {hint && !error && !success && (
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
