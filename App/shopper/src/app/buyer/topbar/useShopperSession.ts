'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { checkLogin, type CheckLoginResult } from '../login/actions';

export function readStoredName() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem('name');
}

export function useShopperSession() {
  const pathname = usePathname();
  const sessionGeneration = useRef(0);
  const [name, setName] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useLayoutEffect(() => {
    const storedName = readStoredName();
    if (storedName) {
      setIsAuthenticated(true);
      setName(storedName);
    }
  }, [pathname]);

  useEffect(() => {
    const generation = sessionGeneration.current;
    let active = true;

    async function verifySession() {
      const storedName = readStoredName();
      const result: CheckLoginResult = await checkLogin().catch(() => ({}));

      if (!active || generation !== sessionGeneration.current) {
        return;
      }

      if (result.user) {
        setIsAuthenticated(true);
        setName(storedName ?? result.user.name);
        return;
      }

      if (storedName) {
        window.sessionStorage.removeItem('name');
      }
      setIsAuthenticated(false);
      setName(null);
    }

    void verifySession();

    return () => {
      active = false;
    };
  }, [pathname]);

  const clearSession = () => {
    sessionGeneration.current += 1;
    window.sessionStorage.removeItem('name');
    setIsAuthenticated(false);
    setName(null);
  };

  return {
    name,
    setName,
    isAuthenticated,
    setIsAuthenticated,
    clearSession,
  };
}
