import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User, Mail, Shield, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { DashboardLayout } from '../components/layout';
import { Button, Input, Card, Badge } from '../components/ui';

export function SettingsPage() {
  const { user, profile, profileLoading, updateProfile } = useAuth();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.warning('Full name is required');
      return;
    }

    setSaving(true);
    const { error } = await updateProfile(fullName.trim());
    setSaving(false);

    if (error) {
      toast.error('Failed to update profile', error.message);
      return;
    }

    toast.success('Profile updated successfully');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Settings</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Manage your account details and registration profile.
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-surface-200 dark:border-surface-800">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-surface-900 dark:text-surface-100">{user.full_name}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{user.email}</p>
                <Badge variant="info" size="sm" className="mt-2 capitalize">
                  <Shield className="w-3 h-3" />
                  {profileLoading && !profile ? 'Loading' : profile?.role ?? user.role}
                </Badge>
              </div>
            </div>

            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              icon={<User className="w-5 h-5" />}
            />

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 h-11 px-4 rounded-xl bg-surface-50 dark:bg-surface-850 border border-surface-200 dark:border-surface-800 text-surface-500 dark:text-surface-400">
                <Mail className="w-5 h-5" />
                <span className="text-sm">{user.email}</span>
              </div>
              <p className="mt-2 text-xs text-surface-400 dark:text-surface-500">
                Contact your administrator to change your email address.
              </p>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                loading={saving}
                icon={<Save className="w-4 h-4" />}
                className="cursor-pointer"
              >
                Save changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
