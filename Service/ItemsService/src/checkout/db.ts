import type { PoolClient } from 'pg';

import { pool } from '../db';
import { itemStatusCaseSql } from '../item/status';

export const CHECKOUT_RESERVATION_MINUTES = 5;

export type ReservationLine = {
  itemId: string;
  quantity: number;
};

export const INSUFFICIENT_STOCK_ERROR =
  'Insufficient stock for one or more items';

export function mergeReservationLines(
  lines: ReservationLine[],
): ReservationLine[] {
  const totals = new Map<string, number>();

  for (const line of lines) {
    totals.set(line.itemId, (totals.get(line.itemId) ?? 0) + line.quantity);
  }

  return [...totals.entries()].map(([itemId, quantity]) => ({
    itemId,
    quantity,
  }));
}

export type ReservationStatus =
  | 'active'
  | 'pending_payment'
  | 'completed'
  | 'released';

type ReservationRow = {
  id: string;
  buyer: string;
  status: ReservationStatus;
  data: { lines: ReservationLine[] };
  expires_at: Date;
};

export async function releaseExpiredReservations(): Promise<void> {
  const { rows } = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM checkout_reservation
      WHERE status IN ('active', 'pending_payment')
        AND expires_at <= now()
    `,
  );

  for (const row of rows) {
    await releaseCheckoutReservation(row.id);
  }
}

export async function releaseBuyerOpenReservations(
  buyerId: string,
): Promise<void> {
  const { rows } = await pool.query<{ id: string }>(
    `
      SELECT id
      FROM checkout_reservation
      WHERE buyer = $1
        AND status IN ('active', 'pending_payment')
    `,
    [buyerId],
  );

  for (const row of rows) {
    await releaseCheckoutReservation(row.id);
  }
}

export async function reserveCheckout(
  buyerId: string,
  lines: ReservationLine[],
): Promise<{ id: string; expiresAt: Date }> {
  const mergedLines = mergeReservationLines(lines);

  await releaseExpiredReservations();
  await releaseBuyerOpenReservations(buyerId);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const line of mergedLines) {
      const newQuantityExpr =
        '(COALESCE((data->>\'quantity\')::int, 1) - $2)';
      const updated = await client.query(
        `
          UPDATE item
          SET
            data = jsonb_set(
              data,
              '{quantity}',
              to_jsonb(${newQuantityExpr}::int),
              true
            ),
            status = ${itemStatusCaseSql(newQuantityExpr)}
          WHERE id = $1
            AND COALESCE((data->>'quantity')::int, 1) >= $2
          RETURNING id
        `,
        [line.itemId, line.quantity],
      );

      if ((updated.rowCount ?? 0) === 0) {
        throw new Error(INSUFFICIENT_STOCK_ERROR);
      }
    }

    const expiresAt = new Date(
      Date.now() + CHECKOUT_RESERVATION_MINUTES * 60 * 1000,
    );
    const inserted = await client.query<{ id: string; expires_at: Date }>(
      `
        INSERT INTO checkout_reservation (buyer, status, data, expires_at)
        VALUES ($1, 'active', $2::jsonb, $3)
        RETURNING id, expires_at
      `,
      [buyerId, JSON.stringify({ lines }), expiresAt],
    );

    await client.query('COMMIT');

    const row = inserted.rows[0];
    if (!row) {
      throw new Error('Failed to create checkout reservation');
    }

    return { id: row.id, expiresAt: row.expires_at };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function restoreReservationStock(
  client: PoolClient,
  lines: ReservationLine[],
): Promise<void> {
  for (const line of lines) {
    const newQuantityExpr =
      '(COALESCE((data->>\'quantity\')::int, 1) + $2)';
    await client.query(
      `
        UPDATE item
        SET
          data = jsonb_set(
            data,
            '{quantity}',
            to_jsonb(${newQuantityExpr}::int),
            true
          ),
          status = ${itemStatusCaseSql(newQuantityExpr)}
        WHERE id = $1
      `,
      [line.itemId, line.quantity],
    );
  }
}

export async function releaseCheckoutReservation(
  reservationId: string,
): Promise<boolean> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const locked = await client.query<ReservationRow>(
      `
        SELECT id, buyer, status, data, expires_at
        FROM checkout_reservation
        WHERE id = $1
        FOR UPDATE
      `,
      [reservationId],
    );

    const row = locked.rows[0];
    if (
      !row ||
      row.status === 'released' ||
      row.status === 'completed'
    ) {
      await client.query('COMMIT');
      return false;
    }

    await restoreReservationStock(client, row.data.lines);

    await client.query(
      `
        UPDATE checkout_reservation
        SET status = 'released'
        WHERE id = $1
      `,
      [reservationId],
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function markCheckoutReservationPendingPayment(
  reservationId: string,
): Promise<boolean> {
  const result = await pool.query(
    `
      UPDATE checkout_reservation
      SET status = 'pending_payment'
      WHERE id = $1
        AND status = 'active'
        AND expires_at > now()
      RETURNING id
    `,
    [reservationId],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function confirmCheckoutReservation(
  reservationId: string,
): Promise<boolean> {
  const result = await pool.query(
    `
      UPDATE checkout_reservation
      SET status = 'completed'
      WHERE id = $1
        AND status IN ('active', 'pending_payment')
      RETURNING id
    `,
    [reservationId],
  );

  return (result.rowCount ?? 0) > 0;
}
