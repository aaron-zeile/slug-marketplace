import { expect, it } from 'vitest';

import {
  parseAddressId,
  parseShippingAddressInput,
  parseShippingAddressList,
} from '../../src/address';

it('accepts and normalizes valid address input', () => {
  const result = parseShippingAddressInput({
    label: '  Home  ',
    line1: ' 123 Main St ',
    city: ' Santa Cruz ',
    state: ' CA ',
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
      state: 'CA',
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
    state: 'CA',
    postal_code: '95060',
    country: 'USA',
  });

  expect(result.success).toBe(false);
});

it('rejects missing state', () => {
  const result = parseShippingAddressInput({
    line1: '123 Main St',
    city: 'test',
    postal_code: '95060',
    country: 'US',
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toMatch(/state/i);
  }
});

it('rejects non-numeric postal codes', () => {
  const result = parseShippingAddressInput({
    line1: '123 Main St',
    city: 'test',
    state: 'CA',
    postal_code: '9506A',
    country: 'US',
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toMatch(/only numbers/i);
  }
});

it('rejects invalid address ids', () => {
  const result = parseAddressId('not-a-uuid');
  expect(result.success).toBe(false);
});

it('accepts legacy addresses with empty state when listing', () => {
  const addresses = parseShippingAddressList([
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      member: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      line1: '123 Main St',
      city: 'Santa Cruz',
      state: '',
      postal_code: '95060',
      country: 'US',
      is_default: true,
      created_at: '2026-05-17T00:00:00.000Z',
      updated_at: '2026-05-17T00:00:00.000Z',
    },
  ]);

  expect(addresses[0]?.state).toBe('');
});
