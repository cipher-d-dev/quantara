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
      className="relative w-10 h-10 rounded-xl bg-surface-100/80 dark:bg-surface-800/80 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors duration-300 flex items-center justify-center group overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Background glow */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          resolvedTheme === 'dark'
            ? 'bg-gradient-to-br from-yellow-400/0 via-yellow-400/0 to-orange-500/0'
            : 'bg-gradient-to-br from-brand-500/0 via-brand-500/0 to-brand-600/0'
        }`}
      />

      {/* Icons */}
      <div
        ref={iconRef}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            resolvedTheme === 'dark'
              ? 'opacity-100 rotate-0'
              : 'opacity-0 rotate-90 absolute'
          }`}
        >
          <Sun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-400 transition-colors" />
        </div>
        <div
          className={`flex items-center justify-center transition-all duration-500 ${
            resolvedTheme === 'light'
              ? 'opacity-100 rotate-0'
              : 'opacity-0 -rotate-90 absolute'
          }`}
        >
          <Moon className="w-5 h-5 text-brand-500 dark:text-brand-400 group-hover:text-brand-400 dark:group-hover:text-brand-300 transition-colors" />
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
