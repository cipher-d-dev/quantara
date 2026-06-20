import { useEffect, useRef, useState } from 'react';
import { CreditCard, MapPin, ShieldCheck, Sparkles, Paperclip, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { supabase } from '../lib/supabase';
import type { Course, RegistrationPackage } from '../types/database';
import {
  formatNaira,
  GENERAL_DELIVERY_LOCATION,
  PACKAGE_OPTIONS,
  UNILAG_DELIVERY_LOCATIONS,
} from '../lib/packages';
import {
  clearPendingRegistration,
  initializePaystackCheckout,
  savePendingRegistration,
} from '../lib/paystack';
interface RegisterPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
  onRegisterComplete: (params: {
    packageType: RegistrationPackage;
    deliveryLocation: string;
    paymentReference: string;
    amountKobo: number;
  }) => Promise<void>;
  isRegistering: boolean;
}

const CUSTOM_LOCATION_VALUE = '__custom__';

export function RegisterPackageModal({
  isOpen,
  onClose,
  course,
  onRegisterComplete: _onRegisterComplete,
  isRegistering,
}: RegisterPackageModalProps) {
  const { user } = useAuth();
  const toast = useToast();
  const [packageType, setPackageType] = useState<RegistrationPackage>('basic');
  const [deliveryLocation, setDeliveryLocation] = useState(GENERAL_DELIVERY_LOCATION);
  const [customLocation, setCustomLocation] = useState('');
  const [outlineFile, setOutlineFile] = useState<File | null>(null);
  const [uploadingOutline, setUploadingOutline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setPackageType('basic');
    setDeliveryLocation(GENERAL_DELIVERY_LOCATION);
    setCustomLocation('');
    setOutlineFile(null);
    setPaying(false);
  }, [isOpen, course?.id]);

  if (!course || !user) return null;

  const selectedPackage = PACKAGE_OPTIONS[packageType];

  const resolveDeliveryLocation = () => {
    if (packageType === 'basic') return GENERAL_DELIVERY_LOCATION;

    if (deliveryLocation === CUSTOM_LOCATION_VALUE) {
      const location = customLocation.trim();
      if (!location) {
        throw new Error('Please specify your UNILAG delivery location');
      }
      return location;
    }

    return deliveryLocation;
  };

  const handlePackageChange = (nextPackage: RegistrationPackage) => {
    setPackageType(nextPackage);
    if (nextPackage === 'basic') {
      setDeliveryLocation(GENERAL_DELIVERY_LOCATION);
      setCustomLocation('');
    } else {
      setDeliveryLocation(UNILAG_DELIVERY_LOCATIONS[1] ?? GENERAL_DELIVERY_LOCATION);
    }
  };

  const handleProceed = async () => {
    // 1. Validate location
    let finalLocation: string;
    try {
      finalLocation = resolveDeliveryLocation();
    } catch (e) {
      toast.warning((e as Error).message);
      return;
    }

    // 2. Validate outline required
    if (!outlineFile) {
      toast.warning('Please attach your course outline before proceeding');
      return;
    }

    setPaying(true);

    try {
      // 3. Upload outline to Supabase Storage
      setUploadingOutline(true);
      const ext = outlineFile.name.split('.').pop();
      const storagePath = `${user!.id}-${course.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('course-outlines')
        .upload(storagePath, outlineFile, { upsert: true });
      setUploadingOutline(false);

      if (uploadError) {
        toast.error('Outline upload failed', uploadError.message);
        setPaying(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('course-outlines')
        .getPublicUrl(storagePath);

      // 4. Initialize Paystack checkout
      const callbackUrl = `${window.location.origin}/payment/callback`;
      const checkout = await initializePaystackCheckout({
        email: user!.email,
        packageType,
        courseId: course.id,
        userId: user!.id,
        deliveryLocation: finalLocation,
        outlineUrl: publicUrl,
        callbackUrl,
      });

      savePendingRegistration({
        courseId: course.id,
        packageType,
        deliveryLocation: finalLocation,
        amountKobo: checkout.amountKobo ?? selectedPackage.amountKobo,
        returnPath: window.location.pathname || '/dashboard',
        outlineUrl: publicUrl,
      });

      window.location.href = checkout.authorizationUrl;
    } catch (err) {
      clearPendingRegistration();
      toast.error('Payment checkout failed', (err as Error).message);
      setPaying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Register for ${course.code}`}
      description="Choose a lab report package and complete payment to reserve your slot."
      size="lg"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-semibold text-surface-900 dark:text-surface-100">
            {course.title}
          </h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
            Your registration is saved after successful Paystack checkout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['basic', 'pro'] as RegistrationPackage[]).map((option) => {
            const details = PACKAGE_OPTIONS[option];
            const selected = packageType === option;
            const Icon = option === 'basic' ? ShieldCheck : Sparkles;

            return (
              <button
                key={option}
                type="button"
                onClick={() => handlePackageChange(option)}
                className={`text-left p-4 rounded-2xl border transition-colors ${
                  selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                    : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand-600 dark:text-brand-300" />
                  </div>
                  <p className="text-base font-bold text-surface-900 dark:text-surface-100">
                    {formatNaira(details.amountKobo)}
                  </p>
                </div>
                <p className="mt-4 font-semibold text-surface-900 dark:text-surface-100">
                  {details.label}
                </p>
                <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                  {details.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-surface-100">
            <MapPin className="w-4 h-4 text-brand-500" />
            Delivery Location
          </div>

          {packageType === 'basic' ? (
            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850 p-4 text-sm text-surface-700 dark:text-surface-300">
              Basic orders are delivered at{' '}
              <span className="font-semibold">{GENERAL_DELIVERY_LOCATION}</span>.
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                options={[
                  ...UNILAG_DELIVERY_LOCATIONS.map((location) => ({
                    label: location,
                    value: location,
                  })),
                  { label: 'Specify another UNILAG location', value: CUSTOM_LOCATION_VALUE },
                ]}
              />
              {deliveryLocation === CUSTOM_LOCATION_VALUE && (
                <Input
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Mariere Hall, Block C"
                />
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-surface-100">
            <Paperclip className="w-4 h-4 text-brand-500" />
            Course Outline
            <span className="text-error-500">*</span>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Attach your course outline (PDF or DOCX) so we can format your lab report correctly.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setOutlineFile(e.target.files?.[0] ?? null)}
          />
          {outlineFile ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/20">
              <Paperclip className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-sm text-surface-700 dark:text-surface-300 flex-1 truncate">
                {outlineFile.name}
              </span>
              <button
                type="button"
                onClick={() => { setOutlineFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-surface-400 hover:text-error-500 transition-colors cursor-pointer"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-sm text-surface-500 hover:border-brand-400 hover:text-brand-500 transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" />
              Attach course outline
            </button>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-surface-200 dark:border-surface-800">
          <Button variant="secondary" onClick={onClose} disabled={paying || isRegistering}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            loading={paying || isRegistering}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Pay {formatNaira(selectedPackage.amountKobo)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
