import 'server-only';

export interface CheckoutReservationLine {
  itemId: string;
  quantity: number;
}

export interface CheckoutReservation {
  id: string;
  expiresAt: string;
}

function itemsServiceUrl() {
  return process.env.ITEMS_SERVICE_URL || 'http://localhost:4000/graphql';
}

async function itemsMutation<T>(
  query: string,
  variables: Record<string, unknown>,
  dataKey: string,
): Promise<T> {
  const response = await fetch(itemsServiceUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Items service request failed: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    const message = body.errors[0]?.message ?? 'GraphQL error';
    throw new Error(message);
  }

  return body.data?.[dataKey] as T;
}

export async function reserveCheckout(
  buyerId: string,
  items: CheckoutReservationLine[],
): Promise<CheckoutReservation> {
  const query = `
    mutation ReserveCheckout($input: ReserveCheckoutInput!) {
      reserveCheckout(input: $input) {
        id
        expiresAt
      }
    }
  `;

  const result = await itemsMutation<CheckoutReservation>(
    query,
    {
      input: { buyerId, items },
    },
    'reserveCheckout',
  );

  return result;
}

export async function releaseCheckoutReservation(
  reservationId: string,
): Promise<boolean> {
  const query = `
    mutation ReleaseCheckoutReservation($input: CheckoutReservationIdInput!) {
      releaseCheckoutReservation(input: $input)
    }
  `;

  return itemsMutation<boolean>(
    query,
    { input: { id: reservationId } },
    'releaseCheckoutReservation',
  );
}

export async function markCheckoutReservationPendingPayment(
  reservationId: string,
): Promise<boolean> {
  const query = `
    mutation MarkCheckoutReservationPendingPayment($input: CheckoutReservationIdInput!) {
      markCheckoutReservationPendingPayment(input: $input)
    }
  `;

  return itemsMutation<boolean>(
    query,
    { input: { id: reservationId } },
    'markCheckoutReservationPendingPayment',
  );
}

export async function confirmCheckoutReservation(
  reservationId: string,
): Promise<boolean> {
  const query = `
    mutation ConfirmCheckoutReservation($input: CheckoutReservationIdInput!) {
      confirmCheckoutReservation(input: $input)
    }
  `;

  return itemsMutation<boolean>(
    query,
    { input: { id: reservationId } },
    'confirmCheckoutReservation',
  );
}
