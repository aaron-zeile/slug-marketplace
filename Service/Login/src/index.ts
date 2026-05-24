export interface Credentials {
  credential: string;
}

export interface Authenticated {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface CorporateApiKeyRequest {
  name: string;
}

export interface CorporateApiKeyCreated {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

export interface ShippingAddress {
  id: string;
  member: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
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
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}
