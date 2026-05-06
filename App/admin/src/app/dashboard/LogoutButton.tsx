'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: LOGOUT_MUTATION }),
    });
    router.push('/');
  };

  return (
    <button onClick={handleLogout} disabled={loading}>
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
