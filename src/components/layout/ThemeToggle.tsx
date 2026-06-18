import { useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import gsap from 'gsap';

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme, isTransitioning } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isTransitioning) return;

    // Icon rotation animation
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotate: resolvedTheme === 'dark' ? 0 : 180,
        scale: 0.8,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          gsap.to(iconRef.current, {
            scale: 1,
            duration: 0.3,
            ease: 'elastic.out(1, 0.5)',
          });
        },
      });
    }

    toggleTheme();
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isTransitioning}
      className="relative w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-800 dark:text-surface-100 transition-colors duration-200 flex items-center justify-center group overflow-hidden disabled:cursor-not-allowed"
      aria-label="Toggle theme"
    >
      <div
        ref={iconRef}
        className="relative w-5 h-5"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
            resolvedTheme === 'dark'
              ? 'opacity-100 rotate-0'
              : 'opacity-0 rotate-90'
          }`}
        >
          <Sun className="w-5 h-5 text-amber-500 dark:text-amber-300" />
        </div>
        <div
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
            resolvedTheme === 'light'
              ? 'opacity-100 rotate-0'
              : 'opacity-0 -rotate-90'
          }`}
        >
          <Moon className="w-5 h-5 text-brand-600 dark:text-brand-300" />
        </div>
      </div>

      {/* Pulse ring on click */}
      <div
        className={`absolute inset-0 rounded-xl transition-transform duration-500 ${
          isTransitioning ? 'scale-100' : 'scale-0'
        }`}
      >
        <div className="absolute inset-0 rounded-xl border-2 border-brand-500/50 animate-ping" />
      </div>
    </button>
  );
}
