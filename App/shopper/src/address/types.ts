export interface ShippingAddress {
  id: string;
  member: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddressInput {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export type AddressActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };
