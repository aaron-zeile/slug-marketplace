import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import Stripe from "stripe";

import { listAddressesAction } from "../../account/actions";
import { checkLogin } from "../../buyer/login/actions";
import { clearCartAction, fetchCartItemsAction } from "../../cart/actions";
import {
  confirmCheckoutReservationAction,
  getCheckoutReservationIdFromCookie,
} from "../reservationActions";
import { createOrderAction } from "../../order/actions";

interface CheckoutCompletePageProps {
  searchParams: Promise<{
    payment_intent?: string;
  }>;
}

function CompletionError({ message }: { message: string }) {
  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 5 },
          textAlign: "center",
          borderRadius: 2,
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
          Unable to complete order
        </Typography>
        <Typography sx={{ mb: 4, color: "text.secondary" }}>
          {message}
        </Typography>
        <Box>
          <Button href="/cart" variant="contained">
            Back to cart
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default async function CheckoutCompletePage({
  searchParams,
}: CheckoutCompletePageProps) {
  const { payment_intent: paymentIntentId } = await searchParams;

  if (!paymentIntentId) {
    return <CompletionError message="Missing payment confirmation." />;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return <CompletionError message="Stripe is not configured." />;
  }

  const session = await checkLogin();
  if (!session.user) {
    redirect("/");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded") {
    return <CompletionError message="The payment has not succeeded yet." />;
  }

  if (paymentIntent.metadata.buyerId !== session.user.id) {
    return <CompletionError message="This payment does not belong to your account." />;
  }

  const addressId = paymentIntent.metadata.addressId;
  if (!addressId) {
    return <CompletionError message="Missing shipping address for this payment." />;
  }

  const [cartResult, addressResult] = await Promise.all([
    fetchCartItemsAction(),
    listAddressesAction(),
  ]);

  const cartItems = cartResult.success && cartResult.data
    ? cartResult.data
    : [];

  if (cartItems.length === 0) {
    redirect("/account/orders");
  }

  const shippingAddress = addressResult.success && addressResult.data
    ? addressResult.data.find((address) => address.id === addressId)
    : undefined;

  if (!shippingAddress) {
    return <CompletionError message="Could not find the shipping address for this order." />;
  }

  const orderResult = await createOrderAction({
    items: cartItems.flatMap((cartItem) =>
      Array.from({ length: cartItem.quantity }, () => ({
        itemId: cartItem.item.id,
        sellerId: cartItem.item.seller.id,
      })),
    ),
    purchaseAmount: paymentIntent.amount_received / 100,
    address: {
      label: shippingAddress.label,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postal_code,
      country: shippingAddress.country,
    },
  });

  if (!orderResult.success) {
    return <CompletionError message={orderResult.error || "Could not create order."} />;
  }

  const reservationId = await getCheckoutReservationIdFromCookie();
  if (reservationId) {
    await confirmCheckoutReservationAction(reservationId);
  }

  await clearCartAction();
  redirect("/account/orders");
}
