import type { ShippingAddressInput } from './types';

export function normalizeAddressInput(
  input: ShippingAddressInput,
): ShippingAddressInput | { error: string } {
  const line1 = input.line1?.trim();
  const city = input.city?.trim();
  const postalCode = input.postal_code?.trim();

  if (!line1) {
    return { error: 'Address line 1 is required' };
  }
  if (!city) {
    return { error: 'City is required' };
  }
  if (!postalCode) {
    return { error: 'Postal code is required' };
  }

  const country = (input.country?.trim().toUpperCase() || 'US');
  if (!/^[A-Z]{2}$/.test(country)) {
    return { error: 'Country must be a 2-letter ISO code' };
  }

  return {
    label: input.label?.trim() || undefined,
    line1,
    line2: input.line2?.trim() || undefined,
    city,
    state: input.state?.trim() || undefined,
    postal_code: postalCode,
    country,
    is_default: input.is_default,
  };
}
