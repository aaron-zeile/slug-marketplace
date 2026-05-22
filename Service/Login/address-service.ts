import type { ShippingAddress, ShippingAddressInput } from './src';
import { getDb } from './service';

function rethrowDbError(error: unknown): never {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '42P01'
  ) {
    throw new Error(
      'shipping_address table is missing. Run Service/Login/sql/migrate-shipping-address.sql against the account database.',
    );
  }
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === '23503'
  ) {
    throw new Error('Member account not found. Please sign in again.');
  }
  throw error;
}

interface AddressData {
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

interface ShippingAddressRow {
  id: string;
  member: string;
  data: AddressData;
}

function mapRow(row: ShippingAddressRow): ShippingAddress {
  return {
    id: row.id,
    member: row.member,
    label: row.data.label,
    line1: row.data.line1,
    line2: row.data.line2,
    city: row.data.city,
    state: row.data.state,
    postal_code: row.data.postal_code,
    country: row.data.country,
    is_default: row.data.is_default,
    created_at: row.data.created_at,
    updated_at: row.data.updated_at,
  };
}

function normalizeCountry(country?: string): string {
  const value = country?.trim().toUpperCase() ?? 'US';
  if (!/^[A-Z]{2}$/.test(value)) {
    throw new Error('Country must be a 2-letter ISO code');
  }
  return value;
}

function validateInput(input: ShippingAddressInput): Omit<AddressData, 'created_at' | 'updated_at' | 'is_default'> & {
  is_default?: boolean;
} {
  const line1 = input.line1?.trim();
  const city = input.city?.trim();
  const postalCode = input.postal_code?.trim();

  if (!line1) {
    throw new Error('Address line 1 is required');
  }
  if (!city) {
    throw new Error('City is required');
  }
  if (!postalCode) {
    throw new Error('Postal code is required');
  }

  return {
    label: input.label?.trim() || undefined,
    line1,
    line2: input.line2?.trim() || undefined,
    city,
    state: input.state?.trim() || undefined,
    postal_code: postalCode,
    country: normalizeCountry(input.country),
    is_default: input.is_default,
  };
}

function buildData(
  validated: ReturnType<typeof validateInput>,
  isDefault: boolean,
  timestamps?: Pick<AddressData, 'created_at' | 'updated_at'>,
): AddressData {
  const now = new Date().toISOString();
  return {
    label: validated.label,
    line1: validated.line1,
    line2: validated.line2,
    city: validated.city,
    state: validated.state,
    postal_code: validated.postal_code,
    country: validated.country,
    is_default: isDefault,
    created_at: timestamps?.created_at ?? now,
    updated_at: timestamps?.updated_at ?? now,
  };
}

async function countAddresses(memberId: string): Promise<number> {
  const result = await getDb().query<{ count: string }>(
    'SELECT COUNT(*)::text AS count FROM shipping_address WHERE member = $1',
    [memberId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

async function clearDefault(memberId: string): Promise<void> {
  await getDb().query(
    `UPDATE shipping_address
     SET data = jsonb_set(data, '{is_default}', 'false'::jsonb, true)
     WHERE member = $1`,
    [memberId],
  );
}

export class AddressService {
  public async list(memberId: string): Promise<ShippingAddress[]> {
    try {
      const result = await getDb().query<ShippingAddressRow>(
        `SELECT id, member, data
         FROM shipping_address
         WHERE member = $1
         ORDER BY (data->>'is_default')::boolean DESC,
                  (data->>'created_at') ASC`,
        [memberId],
      );
      return result.rows.map(mapRow);
    } catch (error) {
      rethrowDbError(error);
    }
  }

  public async create(
    memberId: string,
    input: ShippingAddressInput,
  ): Promise<ShippingAddress> {
    const validated = validateInput(input);
    const existingCount = await countAddresses(memberId);
    const shouldBeDefault =
      validated.is_default === true || existingCount === 0;

    if (shouldBeDefault) {
      await clearDefault(memberId);
    }

    const data = buildData(validated, shouldBeDefault);
    let result;
    try {
      result = await getDb().query<ShippingAddressRow>(
        `INSERT INTO shipping_address (member, data)
         VALUES ($1, $2::jsonb)
         RETURNING id, member, data`,
        [memberId, JSON.stringify(data)],
      );
    } catch (error) {
      rethrowDbError(error);
    }

    return mapRow(result.rows[0]);
  }

  public async update(
    memberId: string,
    addressId: string,
    input: ShippingAddressInput,
  ): Promise<ShippingAddress> {
    const existing = await this.getOwnedAddress(memberId, addressId);
    const validated = validateInput(input);

    if (validated.is_default === true) {
      await clearDefault(memberId);
    }

    const isDefault =
      validated.is_default === true
        ? true
        : validated.is_default === false
          ? false
          : existing.is_default;

    if (validated.is_default === false && existing.is_default) {
      const others = await countAddresses(memberId);
      if (others > 1) {
        throw new Error('Choose another default address before clearing the default');
      }
    }

    const data = buildData(validated, isDefault, {
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    });

    const result = await getDb().query<ShippingAddressRow>(
      `UPDATE shipping_address
       SET data = $3::jsonb
       WHERE id = $1 AND member = $2
       RETURNING id, member, data`,
      [addressId, memberId, JSON.stringify(data)],
    );

    if (!result.rows[0]) {
      throw new Error('Address not found');
    }

    return mapRow(result.rows[0]);
  }

  public async remove(memberId: string, addressId: string): Promise<void> {
    const existing = await this.getOwnedAddress(memberId, addressId);
    await getDb().query(
      'DELETE FROM shipping_address WHERE id = $1 AND member = $2',
      [addressId, memberId],
    );

    if (existing.is_default) {
      const result = await getDb().query<ShippingAddressRow>(
        `SELECT id, member, data
         FROM shipping_address
         WHERE member = $1
         ORDER BY (data->>'created_at') ASC
         LIMIT 1`,
        [memberId],
      );
      const next = result.rows[0];
      if (next) {
        const promoted = {
          ...next.data,
          is_default: true,
          updated_at: new Date().toISOString(),
        };
        await getDb().query(
          'UPDATE shipping_address SET data = $2::jsonb WHERE id = $1',
          [next.id, JSON.stringify(promoted)],
        );
      }
    }
  }

  public async setDefault(
    memberId: string,
    addressId: string,
  ): Promise<ShippingAddress> {
    const existing = await this.getOwnedAddress(memberId, addressId);
    await clearDefault(memberId);

    const data: AddressData = {
      label: existing.label,
      line1: existing.line1,
      line2: existing.line2,
      city: existing.city,
      state: existing.state,
      postal_code: existing.postal_code,
      country: existing.country,
      is_default: true,
      created_at: existing.created_at,
      updated_at: new Date().toISOString(),
    };

    const result = await getDb().query<ShippingAddressRow>(
      `UPDATE shipping_address
       SET data = $3::jsonb
       WHERE id = $1 AND member = $2
       RETURNING id, member, data`,
      [addressId, memberId, JSON.stringify(data)],
    );

    if (!result.rows[0]) {
      throw new Error('Address not found');
    }

    return mapRow(result.rows[0]);
  }

  private async getOwnedAddress(
    memberId: string,
    addressId: string,
  ): Promise<ShippingAddress> {
    const result = await getDb().query<ShippingAddressRow>(
      'SELECT id, member, data FROM shipping_address WHERE id = $1 AND member = $2',
      [addressId, memberId],
    );
    const row = result.rows[0];

    if (!row) {
      throw new Error('Address not found');
    }

    return mapRow(row);
  }
}
