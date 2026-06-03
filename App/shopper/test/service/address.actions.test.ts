import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createAddressAction,
  deleteAddressAction,
  listAddressesAction,
  setDefaultAddressAction,
  updateAddressAction,
} from '../../src/app/account/actions';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from '../../src/server/address/service';
import { check, getSessionToken } from '../../src/server/auth/service';

vi.mock('../../src/server/address/service', () => ({
  listAddresses: vi.fn(),
  createAddress: vi.fn(),
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
  setDefaultAddress: vi.fn(),
}));

vi.mock('../../src/server/auth/service', () => ({
  check: vi.fn(),
  getSessionToken: vi.fn(),
}));

const user = {
  id: '7b355067-1dee-4b9a-a87a-fa745332ecf8',
  email: 'buyer@example.com',
  name: 'Buyer',
};

const address = {
  id: '11111111-1111-4111-8111-111111111111',
  member: user.id,
  label: 'Home',
  line1: '123 Main St',
  city: 'Santa Cruz',
  state: 'CA',
  postal_code: '95060',
  country: 'US',
  is_default: true,
  created_at: '2026-05-17T00:00:00.000Z',
  updated_at: '2026-05-17T00:00:00.000Z',
};

const validInput = {
  line1: '123 Main St',
  city: 'Santa Cruz',
  state: 'CA',
  postal_code: '95060',
  country: 'US',
};

function signIn() {
  vi.mocked(getSessionToken).mockResolvedValue('session-token');
  vi.mocked(check).mockResolvedValue(user);
}

function signOut() {
  vi.mocked(getSessionToken).mockResolvedValue(undefined);
}

describe('account address actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signIn();
    vi.mocked(listAddresses).mockResolvedValue([address]);
    vi.mocked(createAddress).mockResolvedValue(address);
    vi.mocked(updateAddress).mockResolvedValue(address);
    vi.mocked(deleteAddress).mockResolvedValue(undefined);
    vi.mocked(setDefaultAddress).mockResolvedValue(address);
  });

  it('lists addresses for a signed-in user', async () => {
    const result = await listAddressesAction();

    expect(result).toEqual({ success: true, data: [address] });
    expect(listAddresses).toHaveBeenCalledWith('session-token');
  });

  it('returns not signed in for list when there is no session', async () => {
    signOut();

    const result = await listAddressesAction();

    expect(result).toEqual({ success: false, error: 'Not signed in' });
    expect(listAddresses).not.toHaveBeenCalled();
  });

  it('returns service error message when list throws an Error', async () => {
    vi.mocked(listAddresses).mockRejectedValue(new Error('Database offline'));

    const result = await listAddressesAction();

    expect(result).toEqual({ success: false, error: 'Database offline' });
  });

  it('returns generic list error when list throws a non-Error', async () => {
    vi.mocked(listAddresses).mockRejectedValue('offline');

    const result = await listAddressesAction();

    expect(result).toEqual({ success: false, error: 'Unable to load addresses' });
  });

  it('creates an address for a signed-in user', async () => {
    const result = await createAddressAction(validInput);

    expect(result).toEqual({ success: true, data: address });
    expect(createAddress).toHaveBeenCalledWith('session-token', validInput);
  });

  it('returns not signed in for create when there is no session', async () => {
    signOut();

    const result = await createAddressAction(validInput);

    expect(result).toEqual({ success: false, error: 'Not signed in' });
  });

  it('returns validation error for invalid create input', async () => {
    const result = await createAddressAction({ ...validInput, line1: '' });

    expect(result.success).toBe(false);
    expect(createAddress).not.toHaveBeenCalled();
  });

  it('returns generic create error when create throws a non-Error', async () => {
    vi.mocked(createAddress).mockRejectedValue('nope');

    const result = await createAddressAction(validInput);

    expect(result).toEqual({ success: false, error: 'Unable to save address' });
  });

  it('returns service error message when create throws an Error', async () => {
    vi.mocked(createAddress).mockRejectedValue(new Error('Create failed'));

    const result = await createAddressAction(validInput);

    expect(result).toEqual({ success: false, error: 'Create failed' });
  });

  it('updates an address for a signed-in user', async () => {
    const result = await updateAddressAction(address.id, {
      ...validInput,
      label: 'Work',
    });

    expect(result).toEqual({ success: true, data: address });
    expect(updateAddress).toHaveBeenCalledWith(
      'session-token',
      address.id,
      expect.objectContaining({ label: 'Work' }),
    );
  });

  it('returns not signed in for update when there is no session', async () => {
    signOut();

    const result = await updateAddressAction(address.id, validInput);

    expect(result).toEqual({ success: false, error: 'Not signed in' });
  });

  it('returns validation error for invalid update id', async () => {
    const result = await updateAddressAction('bad-id', validInput);

    expect(result.success).toBe(false);
    expect(updateAddress).not.toHaveBeenCalled();
  });

  it('returns validation error for invalid update payload', async () => {
    const result = await updateAddressAction(address.id, { ...validInput, city: '' });

    expect(result.success).toBe(false);
    expect(updateAddress).not.toHaveBeenCalled();
  });

  it('returns generic update error when update throws a non-Error', async () => {
    vi.mocked(updateAddress).mockRejectedValue('nope');

    const result = await updateAddressAction(address.id, validInput);

    expect(result).toEqual({ success: false, error: 'Unable to save address' });
  });

  it('returns service error message when update throws an Error', async () => {
    vi.mocked(updateAddress).mockRejectedValue(new Error('Update failed'));

    const result = await updateAddressAction(address.id, validInput);

    expect(result).toEqual({ success: false, error: 'Update failed' });
  });

  it('deletes an address for a signed-in user', async () => {
    const result = await deleteAddressAction(address.id);

    expect(result).toEqual({ success: true });
    expect(deleteAddress).toHaveBeenCalledWith('session-token', address.id);
  });

  it('returns not signed in for delete when there is no session', async () => {
    signOut();

    const result = await deleteAddressAction(address.id);

    expect(result).toEqual({ success: false, error: 'Not signed in' });
  });

  it('returns validation error for invalid delete id', async () => {
    const result = await deleteAddressAction('bad-id');

    expect(result.success).toBe(false);
    expect(deleteAddress).not.toHaveBeenCalled();
  });

  it('returns generic delete error when delete throws a non-Error', async () => {
    vi.mocked(deleteAddress).mockRejectedValue('nope');

    const result = await deleteAddressAction(address.id);

    expect(result).toEqual({ success: false, error: 'Unable to delete address' });
  });

  it('returns service error message when delete throws an Error', async () => {
    vi.mocked(deleteAddress).mockRejectedValue(new Error('Delete failed'));

    const result = await deleteAddressAction(address.id);

    expect(result).toEqual({ success: false, error: 'Delete failed' });
  });

  it('sets the default address for a signed-in user', async () => {
    const result = await setDefaultAddressAction(address.id);

    expect(result).toEqual({ success: true, data: address });
    expect(setDefaultAddress).toHaveBeenCalledWith('session-token', address.id);
  });

  it('returns not signed in for set default when there is no session', async () => {
    signOut();

    const result = await setDefaultAddressAction(address.id);

    expect(result).toEqual({ success: false, error: 'Not signed in' });
  });

  it('returns validation error for invalid default id', async () => {
    const result = await setDefaultAddressAction('bad-id');

    expect(result.success).toBe(false);
    expect(setDefaultAddress).not.toHaveBeenCalled();
  });

  it('returns generic default error when setDefault throws a non-Error', async () => {
    vi.mocked(setDefaultAddress).mockRejectedValue('nope');

    const result = await setDefaultAddressAction(address.id);

    expect(result).toEqual({
      success: false,
      error: 'Unable to set default address',
    });
  });

  it('returns service error message when setDefault throws an Error', async () => {
    vi.mocked(setDefaultAddress).mockRejectedValue(new Error('Default failed'));

    const result = await setDefaultAddressAction(address.id);

    expect(result).toEqual({ success: false, error: 'Default failed' });
  });
});
