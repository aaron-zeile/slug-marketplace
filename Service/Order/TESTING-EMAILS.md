# Testing order emails

Emails are sent by the **Order service** (`Service/Order`, port 4700). Configure Mailgun in `Service/Order/.env`.

## 1. Purchase email

1. Start Order service: `npm run dev` in `Service/Order`
2. Complete a shopper checkout while signed in with an **authorized** Mailgun recipient email
## 2. Shipped & delivered emails (seller dashboard)

1. Sign in to the **seller** app as the seller who owns the item in the order
2. Open **Sales**
3. For an **Ordered** row, click **Mark shipped** → buyer gets the shipped email
4. For a **Shipping** row, click **Mark delivered** → buyer gets the delivered email

Status must advance in order: `ordered` → `shipping` → `delivered`.

## 3. GraphQL Playground (alternative)

Open http://localhost:4700/playground

**Mark shipped:**

```graphql
mutation {
  updateOrderStatus(input: {
    orderId: "YOUR-ORDER-UUID"
    seller: "YOUR-SELLER-UUID"
    status: SHIPPING
  }) {
    id
    status
  }
}
```

**Mark delivered:** use `status: DELIVERED` (only when current status is `shipping`).

Replace UUIDs from your order row / seller account. The seller UUID must match a seller on that order’s line items.
