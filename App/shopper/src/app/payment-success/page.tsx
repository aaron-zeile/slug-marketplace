import { Box, Button, Container, Paper, Typography } from "@mui/material";

import { clearCartAction } from "../cart/actions";

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    amount?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const { amount } = await searchParams;
  await clearCartAction();

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
          Payment successful
        </Typography>
        <Typography sx={{ mb: 4, color: "text.secondary" }}>
          {amount ? `Your payment of $${amount} was completed.` : "Your payment was completed."}
        </Typography>
        <Box>
          <Button href="/" variant="contained">
            Back to marketplace
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
