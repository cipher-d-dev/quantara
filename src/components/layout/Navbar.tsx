import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut,
  LayoutDashboard,
  Settings,
  User,
  ChevronDown,
  Shield,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import Logo from "../ui/Logo";
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import ThemeToggle from './ThemeToggle';

export function Navbar() {
  const { user, profile, profileLoading, signOut } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial animation
    if (navRef.current) {
      if (location.pathname === '/') {
        gsap.from(navRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
        });
        return;
      }

      gsap.from(navRef.current, {
        y: 0,
        // opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    }

    // Logo hover animation removed — Logo component handles its own CSS hover animation
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    success('Signed out successfully');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'py-3 glass shadow-lg shadow-surface-950/5 dark:shadow-surface-950/30'
        : 'py-4 bg-surface-0/80 dark:bg-surface-950/80 backdrop-blur-md border-b border-surface-200/40 dark:border-surface-800/40'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group cursor-pointer">
              <div ref={logoRef}>
                <Logo />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">
                  Quantara
                </span>
                <span className="text-[10px] text-surface-400 dark:text-surface-500 -mt-0.5 tracking-wide">
                  Laboratory Workflow
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/courses"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${isActive('/courses')
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                  }`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses
                </span>
                {isActive('/courses') && (
                  <div className="absolute inset-0 bg-brand-50 dark:bg-brand-950/30 rounded-lg" />
                )}
              </Link>

              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${isActive('/dashboard')
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                      }`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </span>
                    {isActive('/dashboard') && (
                      <div className="absolute inset-0 bg-brand-50 dark:bg-brand-950/30 rounded-lg" />
                    )}
                  </Link>
                    {profile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${isActive('/admin')
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-100'
                        }`}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Admin
                      </span>
                      {isActive('/admin') && (
                        <div className="absolute inset-0 bg-brand-50 dark:bg-brand-950/30 rounded-lg" />
                      )}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <ThemeToggle />

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-100/80 dark:hover:bg-surface-800/80 transition-colors duration-200 group cursor-pointer"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 transition-shadow duration-300">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success-500 rounded-full border-2 border-surface-0 dark:border-surface-900" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-surface-700 dark:text-surface-300">
                    {user.full_name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-surface-400 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''
                      }`}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-64 bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200/80 dark:border-surface-800/80 shadow-2xl overflow-hidden"
                    style={{
                      animation: 'dropdownSlide 0.2s ease-out',
                    }}
                  >
                    <div className="p-4 bg-gradient-to-br from-brand-500/5 to-brand-600/5 dark:from-brand-500/10 dark:to-brand-600/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-surface-500 dark:text-surface-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-400 capitalize">
                          <Shield className="w-3 h-3" />
                          {profileLoading && !profile ? 'Loading' : profile?.role ?? user.role}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 border-t border-surface-200/60 dark:border-surface-800/60">
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors cursor-pointer"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/30 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="items-center gap-2 hidden sm:flex">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" variant="gradient">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropdownSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes drawerIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes drawerOut {
          from { transform: translateX(0); }
          to   { transform: translateX(100%); }
        }
      `}</style>
    </nav>

    {/* Mobile drawer portal */}
    {createPortal(
      <>
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`md:hidden fixed inset-0 z-40 bg-surface-950/50 backdrop-blur-sm transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-surface-0 dark:bg-surface-950 border-l border-surface-200/60 dark:border-surface-800/60 flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200/60 dark:border-surface-800/60">
            <span className="text-sm font-semibold text-surface-900 dark:text-surface-100">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <Link
              to="/courses"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                isActive('/courses')
                  ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                  : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Courses
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive('/dashboard')
                      ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>

                {profile?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive('/admin')
                        ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                <Link
                  to="/settings"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isActive('/settings')
                      ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* Drawer footer */}
          <div className="px-4 py-5 border-t border-surface-200/60 dark:border-surface-800/60 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">{user.full_name}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </>,
      document.body
    )}
  </>
  );
}
