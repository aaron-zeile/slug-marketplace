export type {
  ShippingAddress,
  ShippingAddressInput,
} from './index';

export {
  AddressIdSchema,
  ShippingAddressInputSchema,
  ShippingAddressSchema,
  parseAddressId,
  parseShippingAddressInput,
} from './index';

export type AddressActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };
