import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  useHasRegistration,
  useHasRegistrationForPaymentReference,
  useRegisterForCourse,
} from '../hooks';
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
  const hasRegistrationMutation = useHasRegistration();
  const hasPaymentReferenceMutation = useHasRegistrationForPaymentReference();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (loading || !user?.id || !reference || startedRef.current) return;
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
          pending?.courseId ||
          (metadata.courseId as string | undefined) ||
          (metadata.course_id as string | undefined);
        const packageType =
          pending?.packageType ||
          (metadata.packageType as RegistrationPackage | undefined) ||
          (metadata.package_type as RegistrationPackage | undefined);
        const deliveryLocation =
          pending?.deliveryLocation ||
          (metadata.deliveryLocation as string | undefined) ||
          (metadata.delivery_location as string | undefined);
        const outlineUrl =
          pending?.outlineUrl ||
          (metadata.outlineUrl as string | undefined) ||
          null;
        const deliveryTime =
          pending?.deliveryTime ||
          (metadata.deliveryTime as string | undefined) ||
          null;
        const amountKobo = pending?.amountKobo ?? verification.amountKobo ?? verification.amount ?? 0;
        const returnPath = pending?.returnPath || '/dashboard';
        const paymentReference = verification.reference || reference!;

        if (!courseId || !packageType || !deliveryLocation) {
          throw new Error('Registration details were not found after payment');
        }

        const verifiedAmount = verification.amountKobo ?? verification.amount;
        if (amountKobo > 0 && verifiedAmount && verifiedAmount !== amountKobo) {
          throw new Error('Paid amount does not match the selected package');
        }

        if (!verification.dbRegistered) {
          const paymentAlreadySaved =
            paymentReference &&
            (await hasPaymentReferenceMutation.mutateAsync(paymentReference));

          if (paymentAlreadySaved) {
            clearPendingRegistration();
            toast.success('Payment confirmed and registration saved');
            navigate(returnPath, { replace: true });
            return;
          }

          try {
            await registerMutation.mutateAsync({
              userId: user!.id,
              courseId,
              packageType,
              deliveryLocation,
              paymentReference,
              paymentStatus: 'paid',
              amountKobo,
              outlineUrl: outlineUrl ?? null,
              deliveryTime: deliveryTime ?? null,
            });
          } catch (registrationError) {
            const message = (registrationError as Error).message.toLowerCase();
            const alreadyRegistered =
              message.includes('already registered') ||
              message.includes('duplicate') ||
              message.includes('conflict');

            if (!alreadyRegistered) throw registrationError;

            const exists = await hasRegistrationMutation.mutateAsync({
              userId: user!.id,
              courseId,
            });

            if (!exists) throw registrationError;
          }
        }

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
  }, [loading, user?.id, reference]);

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
