"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";

import convertToSubcurrency from "@/lib/convertToSubcurrency";

const brandColor = "#0f766e";

interface CheckoutFormProps {
  amount: number;
  addressId: string;
  payLabel: string;
  processingLabel: string;
  paymentError: string;
  disabled?: boolean;
  onPaymentStart?: () => Promise<boolean>;
  onPaymentAbort?: () => Promise<void>;
}

function CheckoutForm({
  amount,
  addressId,
  payLabel,
  processingLabel,
  paymentError,
  disabled = false,
  onPaymentStart,
  onPaymentAbort,
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
      body: JSON.stringify({
        amount: convertToSubcurrency(amount),
        addressId,
      }),
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
  }, [addressId, amount, paymentError]);

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

    if (onPaymentStart) {
      const canContinue = await onPaymentStart();
      if (!canContinue) {
        setLoading(false);
        return;
      }
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/complete`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      if (onPaymentAbort) {
        await onPaymentAbort();
      }
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
        disabled={!stripe || loading || disabled}
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
