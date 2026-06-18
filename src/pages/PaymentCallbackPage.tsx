import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useRegisterForCourse } from '../hooks';
import {
  clearPendingRegistration,
  loadPendingRegistration,
  verifyPaystackPayment,
} from '../lib/paystack';
import type { RegistrationPackage } from '../types/database';
import { Button } from '../components/ui';

export function PaymentCallbackPage() {
  const { user, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const registerMutation = useRegisterForCourse();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (loading || !user || !reference || startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;

    async function completeRegistration() {
      try {
        const verification = await verifyPaystackPayment(reference!);

        if (!verification.success || verification.status !== 'success') {
          throw new Error(verification.message || 'Payment was not successful');
        }

        const pending = loadPendingRegistration();
        const metadata = verification.metadata ?? {};

        const courseId =
          pending?.courseId || (metadata.course_id as string | undefined);
        const packageType =
          pending?.packageType ||
          (metadata.package_type as RegistrationPackage | undefined);
        const deliveryLocation =
          pending?.deliveryLocation ||
          (metadata.delivery_location as string | undefined);
        const amountKobo = pending?.amountKobo ?? verification.amount ?? 0;
        const returnPath = pending?.returnPath || '/dashboard';

        if (!courseId || !packageType || !deliveryLocation) {
          throw new Error('Registration details were not found after payment');
        }

        if (amountKobo > 0 && verification.amount && verification.amount !== amountKobo) {
          throw new Error('Paid amount does not match the selected package');
        }

        await registerMutation.mutateAsync({
          userId: user!.id,
          courseId,
          packageType,
          deliveryLocation,
          paymentReference: verification.reference || reference!,
          paymentStatus: 'paid',
          amountKobo,
        });

        if (cancelled) return;

        clearPendingRegistration();
        toast.success('Payment confirmed and registration saved');
        navigate(returnPath, { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      }
    }

    void completeRegistration();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when auth + reference are ready
  }, [loading, user, reference]);

  if (!loading && !user) {
    return <Navigate to="/login" replace state={{ from: '/payment/callback' }} />;
  }

  if (!reference) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
            Missing payment reference
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Return to your dashboard and try registering again.
          </p>
          <Link to="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-surface-900 dark:text-surface-100">
            Payment verification failed
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">{error}</p>
          <Link to="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mx-auto" />
        <p className="text-sm text-surface-600 dark:text-surface-300">
          Confirming your payment…
        </p>
      </div>
    </div>
  );
}
