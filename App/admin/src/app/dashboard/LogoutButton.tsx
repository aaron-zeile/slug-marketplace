'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import LogoutIcon from '@mui/icons-material/Logout';

const LOGOUT_MUTATION = `
  mutation Logout {
    logout {
      success
    }
  }
`;

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await fetch('/admin/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: LOGOUT_MUTATION }),
    });
    router.push('/');
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outlined"
      color="inherit"
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />}
      sx={{ textTransform: 'none', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
    >
      {loading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
