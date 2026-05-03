'use client';

import * as React from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';
import { useRouter } from 'next/navigation';

const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      message
    }
  }
`;

export default function SignInPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: LOGIN_MUTATION,
          variables: { email, password },
        }),
      });
      const { data, errors } = await res.json();
      if (errors?.length) {
        setError(errors[0].message);
      } else if (data?.login?.success) {
        router.push('/dashboard');
      } else {
        setError(data?.login?.message ?? 'Login failed');
      }
    } catch {
      setError('Network error � please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Admin Sign In
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !email || !password}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
