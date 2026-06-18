import type { RegistrationPackage } from '../types/database';

const API_URL = import.meta.env.VITE_SERVER_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const PENDING_REGISTRATION_KEY = 'quantara_pending_registration';

export type PendingRegistration = {
  courseId: string;
  packageType: RegistrationPackage;
  deliveryLocation: string;
  amountKobo: number;
  returnPath: string;
};

type InitializeResponse = {
  success: boolean;
  authorization_url?: string;
  reference?: string;
  amountKobo?: number;
  message?: string;
};

type VerifyResponse = {
  success: boolean;
  status?: string;
  reference?: string;
  amount?: number;
  amountKobo?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  dbRegistered?: boolean;
  message?: string;
};

export function createPaymentReference(userId: string, courseId: string) {
  return `qr_${userId.slice(0, 8)}_${courseId.slice(0, 8)}_${Date.now()}`;
}

export function savePendingRegistration(pending: PendingRegistration) {
  localStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(pending));
}

export function loadPendingRegistration(): PendingRegistration | null {
  const raw =
    localStorage.getItem(PENDING_REGISTRATION_KEY) ||
    sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  localStorage.removeItem(PENDING_REGISTRATION_KEY);
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}

export async function initializePaystackCheckout({
  email,
  packageType,
  courseId,
  userId,
  deliveryLocation,
  callbackUrl,
}: {
  email: string;
  packageType: RegistrationPackage;
  courseId: string;
  userId: string;
  deliveryLocation: string;
  callbackUrl?: string;
}) {
  const response = await fetch(`${API_URL}/api/paystack/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      packageType,
      courseId,
      userId,
      deliveryLocation,
      callbackUrl: callbackUrl || `${window.location.origin}/payment/callback`,
    }),
  });

  const payload = (await response.json()) as InitializeResponse;

  if (!response.ok || !payload.success || !payload.authorization_url) {
    throw new Error(payload.message || 'Unable to start Paystack checkout');
  }

  return {
    authorizationUrl: payload.authorization_url,
    reference: payload.reference,
    amountKobo: payload.amountKobo,
  };
}

export async function verifyPaystackPayment(reference: string) {
  const response = await fetch(
    `${API_URL}/api/paystack/verify/${encodeURIComponent(reference)}`
  );

  const payload = (await response.json()) as VerifyResponse;

  if (!response.ok) {
    throw new Error(payload.message || 'Unable to verify payment');
  }

  return payload;
}
