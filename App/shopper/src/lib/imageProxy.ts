/** True for http(s) URLs that are not local/private (SSRF guard for the image proxy). */
export function isAllowedRemoteImageUrl(url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return false;
  }

  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1'
  ) {
    return false;
  }

  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return false;
  }
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return false;
  }
  if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host)) {
    return false;
  }

  return true;
}

/** Same-origin URL that fetches the remote image on the server (any allowed host). */
export function proxiedImageUrl(url: string): string {
  if (!url) {
    return '';
  }
  if (!isAllowedRemoteImageUrl(url)) {
    return url;
  }
  return `/api/image?url=${encodeURIComponent(url)}`;
}
