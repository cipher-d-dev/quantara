import { Link } from 'react-router-dom';
import Logo from "../ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-surface-200/60 dark:border-surface-800/60 bg-surface-50/50 dark:bg-surface-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group cursor-pointer">
              <Logo />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-surface-900 dark:text-surface-100 tracking-tight">
                  Quantara
                </span>
                <span className="text-[10px] text-surface-400 dark:text-surface-500 -mt-0.5">
                  Laboratory slot registration
                </span>
              </div>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md leading-relaxed">
              Quantara helps academic labs manage limited lab report service slots. Students browse
              courses, view availability, and register. Administrators control capacity and monitor
              registrations.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-4 uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/courses"
                  className="text-sm text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Course catalog
                </Link>
              </li>
              <li>
                <Link
                  to="/signup"
                  className="text-sm text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Create account
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-sm text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Sign in
                </Link>
              </li>
              <li>
                <a
                  href="/#features"
                  className="text-sm text-surface-500 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                >
                  Features
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-surface-200/60 dark:border-surface-800/60">
          <p className="text-sm text-surface-400 dark:text-surface-500">
            © {new Date().getFullYear()} Quantara. Laboratory workflow registration platform.
          </p>
        </div>
      </div>
    </footer>
  );
}
