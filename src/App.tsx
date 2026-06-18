import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth, getDefaultRouteForRole } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import {
  LandingPage,
  LoginPage,
  SignupPage,
  StudentDashboard,
  AdminDashboard,
  CourseCatalogPage,
  SettingsPage,
} from './pages';
import { Skeleton } from './components/ui';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function LoadingScreen() {
  const location = useLocation();
  const path = location.pathname;

  // Render different skeletons based on route
  const renderContent = () => {
    if (path === '/admin') {
      return (
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>

          {/* 4 Admin Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="w-10 h-10 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Admin Table skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-12 w-64 rounded-xl" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="border border-surface-200/60 dark:border-surface-800/60 rounded-2xl overflow-hidden divide-y divide-surface-200/60 dark:divide-surface-800/60 bg-surface-0 dark:bg-surface-900">
              <div className="bg-surface-50 dark:bg-surface-850 px-6 py-4 flex gap-8">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-6 py-4 flex gap-8 items-center">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (path === '/settings') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-pulse">
          <div className="space-y-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="p-8 rounded-3xl border border-surface-200/60 dark:border-surface-800/60 bg-surface-0 dark:bg-surface-900 space-y-8">
            {/* Profile Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-surface-200 dark:border-surface-800">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full rounded-xl" />
                <Skeleton className="h-3.5 w-64" />
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <Skeleton className="h-11 w-36 rounded-xl" />
            </div>
          </div>
        </div>
      );
    }

    if (path === '/courses') {
      return (
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-8 animate-pulse">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-5 w-96 mx-auto" />
            <Skeleton className="h-12 w-96 mx-auto rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-3xl border border-surface-200/60 dark:border-surface-800/60 space-y-4 bg-surface-0 dark:bg-surface-900">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-between items-center pt-4 border-t border-surface-200/60 dark:border-surface-800/60">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-28 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Default to /dashboard (Student Dashboard)
    return (
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Mock Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 space-y-3">
              <Skeleton className="h-4 w-28" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="w-10 h-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>

        {/* Mock Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 space-y-6 bg-surface-0 dark:bg-surface-900">
            <div className="flex justify-between items-center border-b border-surface-200/60 dark:border-surface-800/60 pb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mock Course Cards */}
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-surface-200/60 dark:border-surface-850 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-9 w-20 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-surface-200/60 dark:border-surface-800/60 space-y-6 bg-surface-0 dark:bg-surface-900">
            <div className="border-b border-surface-200/60 dark:border-surface-800/60 pb-4">
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-0 dark:bg-surface-950">
      {/* Skeleton Header (Always rendered) */}
      <div className="h-20 border-b border-surface-200/40 dark:border-surface-800/40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-[25%]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {renderContent()}
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { session, user, loading, profileLoading } = useAuth();
  const location = useLocation();
  console.log(user)

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!user || profileLoading) return <LoadingScreen />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { session, user, loading, profileLoading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (session && !user) return <Navigate to="/dashboard" replace />;
  if (session && user && profileLoading) return <LoadingScreen />;
  if (user) return <Navigate to={getDefaultRouteForRole(user.role)} replace />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignupPage />
          </GuestRoute>
        }
      />
      <Route path="/courses" element={<CourseCatalogPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <AppRoutes />
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
