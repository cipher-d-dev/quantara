import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Save, Settings, Shield, User } from 'lucide-react';
import gsap from 'gsap';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DashboardLayout } from '../components/layout';
import { Badge, Button, Input } from '../components/ui';

export function SettingsPage() {
  const { user, profile, profileLoading, updateProfile } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) setFullName(user.full_name);
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' });
      gsap.from(cardRef.current, { y: 24, opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.15 });
    });
    return () => ctx.revert();
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.warning('Full name is required'); return; }
    setSaving(true);
    const { error } = await updateProfile(fullName.trim());
    setSaving(false);
    if (error) { toast.error('Failed to update profile', error.message); return; }
    toast.success('Profile updated successfully');
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950 relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(99,102,241,0.06)_0%,transparent_70%)]" />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div ref={headerRef} className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow">
              <Settings className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-50 tracking-tight">Settings</h1>
              <p className="text-sm text-surface-500 mt-0.5">Manage your account details and registration profile.</p>
            </div>
          </div>

          <div ref={cardRef} className="rounded-2xl bg-white dark:bg-surface-900/60 border border-surface-200 dark:border-surface-800/60 shadow-soft overflow-hidden">
            {/* Profile header */}
            <div className="px-6 py-5 bg-gradient-to-r from-brand-50 dark:from-brand-500/5 to-brand-100/50 dark:to-brand-600/5 border-b border-surface-200 dark:border-surface-800/60">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-glow shrink-0">
                  <User className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-semibold text-surface-900 dark:text-surface-100">{user.full_name}</p>
                  <p className="text-sm text-surface-500">{user.email}</p>
                  <Badge variant="info" size="sm" className="mt-2 capitalize inline-flex items-center gap-1">
                    <Shield className="w-3 h-3" aria-hidden="true" />
                    {profileLoading && !profile ? 'Loading…' : profile?.role ?? user.role}
                  </Badge>
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="px-6 py-6 space-y-5">
              <Input
                label="Full name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                icon={<User className="w-5 h-5" aria-hidden="true" />}
              />
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label>
                <div className="flex items-center gap-3 h-11 px-4 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700/40 text-surface-500 select-none">
                  <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span className="text-sm truncate">{user.email}</span>
                </div>
                <p className="mt-1.5 text-xs text-surface-400 dark:text-surface-600">Contact your administrator to change your email address.</p>
              </div>
              <div className="pt-2">
                <Button type="submit" loading={saving} icon={<Save className="w-4 h-4" aria-hidden="true" />} className="shadow-glow cursor-pointer">
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
