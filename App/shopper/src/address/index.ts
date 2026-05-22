import * as z from 'zod';

const countryCode = z
  .string()
  .transform((value) => (value.trim() ? value.trim().toUpperCase() : 'US'))
  .pipe(
    z
      .string()
      .regex(/^[A-Z]{2}$/, 'Country must be a 2-letter ISO code'),
  );

const optionalTrimmed = z
  .string()
  .optional()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed ? trimmed : undefined;
  });

function requiredTrimmed(message: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value : ''),
    z
      .string()
      .transform((trimmed) => trimmed.trim())
      .pipe(z.string().min(1, message)),
  );
}

export const ShippingAddressInputSchema = z.object({
  label: optionalTrimmed,
  line1: requiredTrimmed('Address line 1 is required'),
  line2: optionalTrimmed,
  city: requiredTrimmed('City is required'),
  state: optionalTrimmed,
  postal_code: requiredTrimmed('Postal code is required'),
  country: z
    .string()
    .optional()
    .transform((value) => value ?? '')
    .pipe(countryCode),
  is_default: z.boolean().optional(),
});

export const ShippingAddressSchema = z.object({
  id: z.uuid(),
  member: z.uuid(),
  label: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().optional(),
  postal_code: z.string().min(1),
  country: z.string().length(2),
  is_default: z.boolean(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

export const AddressIdSchema = z.uuid();

export type ShippingAddressInput = z.infer<typeof ShippingAddressInputSchema>;
export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;

export function parseShippingAddressInput(
  input: unknown,
):
  | { success: true; data: ShippingAddressInput }
  | { success: false; error: string } {
  const result = ShippingAddressInputSchema.safeParse(input);
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      success: false,
      error: issue?.message ?? 'Invalid address',
    };
  }
  return { success: true, data: result.data };
}

export function parseAddressId(
  addressId: unknown,
):
  | { success: true; data: string }
  | { success: false; error: string } {
  const result = AddressIdSchema.safeParse(addressId);
  if (!result.success) {
    return { success: false, error: 'Invalid address id' };
  }
  return { success: true, data: result.data };
}
