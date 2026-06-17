import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react';
import gsap from 'gsap';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionRef = useRef<GSAPTimeline | null>(null);

  const getResolvedTheme = useCallback((themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeValue;
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    const updateTheme = () => {
      const resolved = getResolvedTheme(theme);
      setResolvedTheme(resolved);

      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    };

    updateTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        updateTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, getResolvedTheme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    const root = window.document.documentElement;
    const currentResolved = getResolvedTheme(theme);
    const newResolved = getResolvedTheme(newTheme);

    if (currentResolved !== newResolved) {
      // Animate the transition
      setIsTransitioning(true);

      // Create overlay for view transitions
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        background: ${newResolved === 'dark' ? '#09090b' : '#ffffff'};
        opacity: 0;
      `;
      document.body.appendChild(overlay);

      // Animate
      transitionRef.current = gsap.timeline({
        onComplete: () => {
          root.classList.remove('light', 'dark');
          root.classList.add(newResolved);
          overlay.remove();
          setIsTransitioning(false);
        },
      });

      transitionRef.current
        .to(overlay, {
          opacity: 0.3,
          duration: 0.2,
          ease: 'power2.out',
        })
        .to(overlay, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        });
    }

    setThemeState(newTheme);
  }, [theme, getResolvedTheme]);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, toggleTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
