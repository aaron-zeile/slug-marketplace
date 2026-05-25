"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { CartItem } from "../../../cart";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { listAddressesAction } from "../../account/actions";
import { fetchCartItemsAction } from "../../cart/actions";
import type { ShippingAddress } from "../../../address/types";
import CheckoutForm from "../components/CheckoutPage";

const brandColor = "#0f766e";
const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

function localeTagForNumbers(locale: string): string {
  if (locale.startsWith("fr")) {
    return "fr-FR";
  }
  return "en-US";
}

function formatAddress(address: ShippingAddress): string {
  return [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

interface PaymentProps {
  addressId: string;
}

export default function Payment({ addressId }: PaymentProps) {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(localeTagForNumbers(locale), {
        style: "currency",
        currency: "USD",
      }),
    [locale],
  );

  useEffect(() => {
    async function loadCheckout() {
      const [cartResult, addressResult] = await Promise.all([
        fetchCartItemsAction(),
        listAddressesAction(),
      ]);

      if (!cartResult.success || !cartResult.data) {
        setError(
          typeof cartResult.error === "string"
            ? cartResult.error
            : t("paymentLoadError"),
        );
        setLoading(false);
        return;
      }

      if (cartResult.data.length === 0) {
        router.replace("/cart");
        return;
      }

      setCartItems(cartResult.data);

      if (addressResult.success && addressResult.data) {
        const selected = addressResult.data.find(
          (entry) => entry.id === addressId,
        );
        setShippingAddress(selected ?? null);
      }

      setLoading(false);
    }

    void loadCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressId]);

  const itemCount = cartItems.reduce(
    (total, cartItem) => total + cartItem.quantity,
    0,
  );
  const subtotal = cartItems.reduce(
    (total, cartItem) => total + cartItem.item.price * cartItem.quantity,
    0,
  );
  const formattedTotal = currencyFormatter.format(subtotal);
  const payLabel = t("payAmount", { amount: formattedTotal });

  if (!stripePublicKey) {
    return (
      <Container component="main" maxWidth="md" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            textAlign: "center",
          }}
        >
          <Typography component="h1" sx={{ fontSize: "1.5rem", fontWeight: 700 }}>
            {t("paymentNotConfigured")}
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Typography sx={{ color: "text.secondary" }}>{t("paymentLoading")}</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography component="h1" sx={{ fontSize: "1.75rem", fontWeight: 700 }}>
          {t("paymentTitle")}
        </Typography>
        <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
          {t("paymentSubtitle")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Stack spacing={2}>
          <Paper
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
              {t("orderSummary")}
            </Typography>

            <Stack spacing={1.5} divider={<Divider flexItem />}>
              {cartItems.map((cartItem) => (
                <Box
                  key={cartItem.item.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {cartItem.item.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {t("quantityLine", { count: cartItem.quantity })}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                    {currencyFormatter.format(
                      cartItem.item.price * cartItem.quantity,
                    )}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>{t("total")}</Typography>
              <Typography
                sx={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: brandColor,
                }}
              >
                {formattedTotal}
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
              {itemCount === 1
                ? t("itemsInOrder_one", { count: itemCount })
                : t("itemsInOrder_other", { count: itemCount })}
            </Typography>
          </Paper>

          {shippingAddress ? (
            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                {t("shippingTo")}
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {shippingAddress.label || t("untitledAddress")}
              </Typography>
              <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
                {formatAddress(shippingAddress)}
              </Typography>
            </Paper>
          ) : null}

          <Button variant="outlined" component={Link} href="/checkout/shipping">
            {t("backToShipping")}
          </Button>
        </Stack>

        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
            {t("paymentDetails")}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {t("paymentDetailsHint")}
          </Typography>

          <Elements
            key={subtotal}
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(subtotal),
              currency: "usd",
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: brandColor,
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CheckoutForm
              amount={subtotal}
              addressId={addressId}
              payLabel={payLabel}
              processingLabel={t("processingPayment")}
              paymentError={t("paymentStartError")}
            />
          </Elements>
        </Paper>
      </Box>
    </Container>
  );
}
