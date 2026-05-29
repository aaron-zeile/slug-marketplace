function orderServiceUrl() {
  return process.env.ORDER_SERVICE_URL || 'http://localhost:4700/graphql';
}

export async function buyerHasOrderedItem(
  buyer: string,
  itemId: string,
): Promise<boolean> {
  const query = `
    query BuyerHasOrderedItem($input: BuyerHasOrderedItemInput!) {
      buyerHasOrderedItem(input: $input)
    }
  `;

  const response = await fetch(orderServiceUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        input: { buyer, itemId },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to verify purchase: ${response.statusText}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    const message =
      typeof body.errors[0]?.message === 'string'
        ? body.errors[0].message
        : 'GraphQL error';
    throw new Error(message);
  }

  return Boolean(body.data?.buyerHasOrderedItem);
}
