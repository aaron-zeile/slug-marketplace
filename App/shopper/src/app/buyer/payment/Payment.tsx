"use client";
// https://www.youtube.com/watch?v=fgbEwVWlpsI
import CheckoutPage from "../components/CheckoutPage";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

export default function Payment() {
  const amount = 49.99;

  if (!stripePublicKey) {
    return (
      <Container component="main" maxWidth="lg" sx={{ py: 5 }}>
        <Paper
          elevation={4}
          sx={{
            mx: "auto",
            p: { xs: 3, sm: 5 },
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography component="h1" sx={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Payment is not configured
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 5 }}>
      <Paper
        elevation={4}
        sx={{
          mx: "auto",
          p: { xs: 3, sm: 5 },
          overflow: "hidden",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          color: "common.white",
          textAlign: "center",
          background:
            "linear-gradient(35deg, #3b82f6 0%, #8b5cf6 100%)",
        }}
      >
        <Stack spacing={4}>
          <Box>
            <Typography
              component="h1"
              sx={{
                mb: 1,
                fontSize: { xs: "2rem", sm: "2.5rem" },
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              Sonny
            </Typography>
            <Typography
              component="h2"
              sx={{
                fontSize: { xs: "1.35rem", sm: "1.5rem" },
                lineHeight: 1.35,
              }}
            >
              has requested
              <Box component="span" sx={{ fontWeight: 700 }}>
                {" "}
                ${amount}
              </Box>
            </Typography>
          </Box>

          <Elements
            stripe={stripePromise}
            options={{
              mode: "payment",
              amount: convertToSubcurrency(amount),
              currency: "usd",
            }}
          >
            <CheckoutPage amount={amount} />
          </Elements>
        </Stack>
      </Paper>
    </Container>
  );
}
