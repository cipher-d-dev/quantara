import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-0 dark:bg-surface-950">
      <Navbar />
      <main className="flex-1 pt-20">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  return <Layout showFooter={false}>{children}</Layout>;
}
