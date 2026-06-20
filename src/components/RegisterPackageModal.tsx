import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, MapPin, Clock, ShieldCheck, Sparkles, Paperclip, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { DateTimePicker } from './ui/DateTimePicker';
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
  const [deliveryTime, setDeliveryTime] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // minimum = 2 days from now, formatted for datetime-local input
  const minDateTime = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  })();

  useEffect(() => {
    if (!isOpen) return;

    setPackageType('basic');
    setDeliveryLocation(GENERAL_DELIVERY_LOCATION);
    setCustomLocation('');
    setOutlineFile(null);
    setPaying(false);
    setDeliveryTime('');
    setConfirmOpen(false);
    setTermsAgreed(false);
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

    // 2. Validate lab guidelines required
    if (!outlineFile) {
      toast.warning('Please attach your lab guidelines before proceeding');
      return;
    }

    // 3. Validate delivery time (optional for basic, required for pro)
    if (packageType === 'pro' && !deliveryTime) {
      toast.warning('Please select a preferred delivery date and time');
      return;
    }
    if (deliveryTime && new Date(deliveryTime) < new Date(minDateTime)) {
      toast.warning('Delivery time must be at least 2 days from now');
      return;
    }

    // All validated — open confirmation modal
    setConfirmOpen(true);
  };

  const handleConfirmPayment = async () => {
    setConfirmOpen(false);

    let finalLocation: string;
    try {
      finalLocation = resolveDeliveryLocation();
    } catch (e) {
      toast.warning((e as Error).message);
      return;
    }

    setPaying(true);

    try {
      // Upload lab guidelines to Supabase Storage
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
        deliveryTime: deliveryTime || null,
        outlineUrl: publicUrl,
        callbackUrl,
      });

      savePendingRegistration({
        courseId: course.id,
        packageType,
        deliveryLocation: finalLocation,
        deliveryTime: deliveryTime || null,
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
    <>
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

        <fieldset>
          <legend className="sr-only">Select package</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['basic', 'pro'] as RegistrationPackage[]).map((option) => {
              const details = PACKAGE_OPTIONS[option];
              const selected = packageType === option;
              const Icon = option === 'basic' ? ShieldCheck : Sparkles;

              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => handlePackageChange(option)}
                  className={`text-left p-4 rounded-2xl border transition-colors ${
                    selected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30'
                      : 'border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 hover:border-surface-300 dark:hover:border-surface-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-600 dark:text-brand-300" aria-hidden="true" />
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
        </fieldset>

        <div className="space-y-3">
          <p id="delivery-location-label" className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-surface-100">
            <MapPin className="w-4 h-4 text-brand-500" aria-hidden="true" />
            Delivery Location
          </p>

          {packageType === 'basic' ? (
            <div aria-labelledby="delivery-location-label" className="rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-850 p-4 text-sm text-surface-700 dark:text-surface-300">
              Basic orders are delivered at{' '}
              <span className="font-semibold">{GENERAL_DELIVERY_LOCATION}</span>.
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                aria-labelledby="delivery-location-label"
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
                  aria-label="Custom UNILAG delivery location"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  placeholder="e.g. Mariere Hall, Block C"
                />
              )}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p id="lab-guidelines-label" className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-surface-100">
            <Paperclip className="w-4 h-4 text-brand-500" aria-hidden="true" />
            Lab Guidelines
            <span className="text-error-500" aria-label="required">*</span>
          </p>
          <p className="text-xs text-surface-500 dark:text-surface-400">
            Attach your lab guidelines (PDF or DOCX) so we can format your lab report correctly.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            aria-label="Lab guidelines file"
            aria-labelledby="lab-guidelines-label"
            className="hidden"
            onChange={(e) => setOutlineFile(e.target.files?.[0] ?? null)}
          />
          {uploadingOutline ? (
            <div aria-live="polite" className="flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 text-sm text-surface-500">
              Uploading…
            </div>
          ) : outlineFile ? (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/20">
              <Paperclip className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
              <span className="text-sm text-surface-700 dark:text-surface-300 flex-1 truncate">
                {outlineFile.name}
              </span>
              <button
                type="button"
                onClick={() => { setOutlineFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="text-surface-400 hover:text-error-500 transition-colors cursor-pointer"
                aria-label="Remove file"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-labelledby="lab-guidelines-label"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 text-sm text-surface-500 hover:border-brand-400 hover:text-brand-500 transition-colors cursor-pointer"
            >
              <Paperclip className="w-4 h-4" aria-hidden="true" />
              Attach lab guidelines
            </button>
          )}
        </div>

        <div className="space-y-3">
          <p id="delivery-time-label" className="flex items-center gap-2 text-sm font-semibold text-surface-900 dark:text-surface-100">
            <Clock className="w-4 h-4 text-brand-500" aria-hidden="true" />
            Preferred Delivery Date &amp; Time
            {packageType === 'pro' && <span className="text-error-500" aria-label="required">*</span>}
          </p>
          {packageType === 'basic' ? (
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Select a preferred time. An admin will reach out to confirm the exact pickup time for Basic orders.
            </p>
          ) : (
            <p className="text-xs text-surface-500 dark:text-surface-400">
              Choose when you'd like your report delivered. Minimum 2 days from today.
            </p>
          )}
          <DateTimePicker
            aria-labelledby="delivery-time-label"
            value={deliveryTime}
            onChange={setDeliveryTime}
            min={minDateTime}
            placeholder="Pick a date & time"
          />
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

    {/* Payment confirmation modal */}
    <Modal
      isOpen={confirmOpen}
      onClose={() => setConfirmOpen(false)}
      title="Confirm Payment"
      size="sm"
    >
      <div className="space-y-5">
        <p className="text-sm text-surface-600 dark:text-surface-400">
          You are about to pay <span className="font-semibold text-surface-900 dark:text-surface-100">{formatNaira(selectedPackage.amountKobo)}</span> for the <span className="font-semibold text-surface-900 dark:text-surface-100">{selectedPackage.label}</span> package on <span className="font-semibold text-surface-900 dark:text-surface-100">{course.code}</span>.
        </p>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
          />
          <span className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
            I have read and agree to the{' '}
            <Link
              to="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Terms &amp; Conditions
            </Link>
          </span>
        </label>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPayment}
            disabled={!termsAgreed}
            icon={<CreditCard className="w-4 h-4" />}
          >
            Confirm &amp; Pay
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
