import { expect, it } from 'vitest';

import { parseAddressId, parseShippingAddressInput } from '../../src/address';

it('accepts and normalizes valid address input', () => {
  const result = parseShippingAddressInput({
    label: '  Home  ',
    line1: ' 123 Main St ',
    city: ' Santa Cruz ',
    postal_code: ' 95060 ',
    country: 'us',
    is_default: true,
  });

  expect(result).toEqual({
    success: true,
    data: {
      label: 'Home',
      line1: '123 Main St',
      city: 'Santa Cruz',
      postal_code: '95060',
      country: 'US',
      is_default: true,
    },
  });
});

it('rejects missing required fields', () => {
  const result = parseShippingAddressInput({
    city: 'test',
    country: 'US',
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toMatch(/line 1/i);
  }
});

it('rejects invalid country codes', () => {
  const result = parseShippingAddressInput({
    line1: '123 Main St',
    city: 'test',
    postal_code: '95060',
    country: 'USA',
  });

  expect(result.success).toBe(false);
});

it('rejects invalid address ids', () => {
  const result = parseAddressId('not-a-uuid');
  expect(result.success).toBe(false);
});
