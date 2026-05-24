/**
 * Shopper app home URL for links and auth redirects.
 *
 * - Local dev (Vite or /seller via shopper proxy): set VITE_SHOPPER_URL=http://localhost:3000
 * - Production same host (shopper at /, seller at /seller): leave unset → uses site origin + /
 * - Production split hosts: set VITE_SHOPPER_URL=https://your-shopper-domain.example
 */
export function getShopperHomeUrl(returnTo?: string): string {
  const fromEnv = import.meta.env.VITE_SHOPPER_URL?.trim();

  const home = fromEnv
    ? new URL(fromEnv)
    : import.meta.env.DEV
      ? new URL('http://localhost:3000/')
      : new URL('/', window.location.origin);

  if (returnTo) {
    home.searchParams.set('returnTo', returnTo);
  }

  return home.toString();
}
