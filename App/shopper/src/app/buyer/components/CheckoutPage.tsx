"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import convertToSubcurrency from "@/lib/convertToSubcurrency";

const brandColor = "#0f766e";

interface CheckoutFormProps {
  amount: number;
  payLabel: string;
  processingLabel: string;
  paymentError: string;
}

function CheckoutForm({
  amount,
  payLabel,
  processingLabel,
  paymentError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/buyer/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unable to start payment");
        }

        return res.json();
      })
      .then((data) => {
        if (!data.clientSecret) {
          throw new Error("Unable to start payment");
        }

        setClientSecret(data.clientSecret);
      })
      .catch(() => {
        setErrorMessage(paymentError);
      });
  }, [amount, paymentError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(undefined);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?amount=${amount}`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  };

  if (errorMessage && !clientSecret) {
    return (
      <Alert severity="error" role="alert">
        {errorMessage}
      </Alert>
    );
  }

  if (!clientSecret || !stripe || !elements) {
    return (
      <Stack spacing={1.5} sx={{ py: 4, alignItems: 'center' }}>
        <CircularProgress size={32} sx={{ color: brandColor }} />
      </Stack>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
      }}
    >
      <PaymentElement />

      {errorMessage ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      ) : null}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={!stripe || loading}
        sx={{
          mt: 2.5,
          py: 1.5,
          fontWeight: 700,
          bgcolor: brandColor,
          "&:hover": { bgcolor: "#0d6558" },
        }}
      >
        {loading ? processingLabel : payLabel}
      </Button>
    </Box>
  );
}

export default CheckoutForm;
