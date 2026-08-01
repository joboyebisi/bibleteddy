/** Canonical public site URL for redirects (production env wins over localhost). */
export function getSiteUrl(fallbackOrigin) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  if (fallbackOrigin) {
    return fallbackOrigin.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/** Client-side site URL helper */
export function getClientSiteUrl() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

export function authCallbackUrl(next = "/parent") {
  const base = getClientSiteUrl();
  return `${base}/onboarding/auth/callback?next=${encodeURIComponent(next)}`;
}
