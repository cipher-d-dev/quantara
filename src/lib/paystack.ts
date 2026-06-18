import type { RegistrationPackage } from '../types/database';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  message?: string;
};

type VerifyResponse = {
  success: boolean;
  status?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
  message?: string;
};

export function createPaymentReference(userId: string, courseId: string) {
  return `qr_${userId.slice(0, 8)}_${courseId.slice(0, 8)}_${Date.now()}`;
}

export function savePendingRegistration(pending: PendingRegistration) {
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(pending));
}

export function loadPendingRegistration(): PendingRegistration | null {
  const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}

export async function initializePaystackCheckout({
  email,
  amountKobo,
  reference,
  metadata,
  callbackUrl,
}: {
  email: string;
  amountKobo: number;
  reference: string;
  metadata?: Record<string, unknown>;
  callbackUrl?: string;
}) {
  const response = await fetch(`${API_URL}/api/paystack/initialize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      amount: amountKobo,
      reference,
      currency: 'NGN',
      callback_url: callbackUrl || `${window.location.origin}/payment/callback`,
      metadata,
    }),
  });

  const payload = (await response.json()) as InitializeResponse;

  if (!response.ok || !payload.success || !payload.authorization_url) {
    throw new Error(payload.message || 'Unable to start Paystack checkout');
  }

  return {
    authorizationUrl: payload.authorization_url,
    reference: payload.reference || reference,
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
