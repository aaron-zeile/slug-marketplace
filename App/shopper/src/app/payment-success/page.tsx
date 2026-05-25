import { Box, Button, Container, Paper, Typography } from "@mui/material";

export default async function PaymentSuccessPage() {
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
          Your payment was completed.
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
