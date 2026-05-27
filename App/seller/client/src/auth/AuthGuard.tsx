import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { getShopperHomeUrl } from '../config/shopperUrl';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionResponse {
  user: SessionUser;
}

export default function AuthGuard() {
  const [session, setSession] = useState<SessionUser | undefined>(undefined);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch('/seller/api/sessions', { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          setSession(undefined);
          return;
        }
        const data = (await response.json()) as SessionResponse;
        setSession(data.user);
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
        setSession(undefined);
      })
      .finally(() => {
        setChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!checked || session) {
      return;
    }

    window.location.replace(getShopperHomeUrl());
  }, [checked, session]);

  if (!checked || !session) {
    return null;
  }

  return <Outlet />;
}
