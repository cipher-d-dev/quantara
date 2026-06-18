import type { RegistrationPackage } from '../types/database';

export const GENERAL_DELIVERY_LOCATION = 'The Engineering Civil Shed';

export const UNILAG_DELIVERY_LOCATIONS = [
  'The Engineering Civil Shed',
  'Senate House',
  'University Library',
  'Lagoon Front',
  'Sport Centre',
  'Faculty of Science',
  'Faculty of Arts',
  'New Hall',
  'DLI',
  'Jaja Hall',
];

function readAmount(name: string, fallback: number) {
  const value = Number(import.meta.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const PACKAGE_OPTIONS: Record<
  RegistrationPackage,
  {
    label: string;
    amountKobo: number;
    description: string;
  }
> = {
  basic: {
    label: 'Basic',
    amountKobo: readAmount('VITE_BASIC_PACKAGE_AMOUNT_KOBO', 300000),
    description: `Lab report written and delivered at ${GENERAL_DELIVERY_LOCATION}.`,
  },
  pro: {
    label: 'Pro',
    amountKobo: readAmount('VITE_PRO_PACKAGE_AMOUNT_KOBO', 400000),
    description: 'Lab report written and delivered to a major UNILAG location you choose.',
  },
};

export function formatNaira(amountKobo: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amountKobo / 100);
}
