/**
 * Canonical site URL — env vars always win over request origin so OAuth
 * never redirects to localhost after a production login.
 */
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

export function getYouVersionConfig(fallbackOrigin) {
  const appKey =
    process.env.YOUVERSION_APP_KEY ||
    process.env.YVP_APP_KEY ||
    process.env.YOUVERSION_API_TOKEN;

  const siteUrl = getSiteUrl(fallbackOrigin);
  const redirectUri =
    process.env.YOUVERSION_REDIRECT_URI ||
    `${siteUrl}/onboarding/youversion/callback`;

  return {
    appKey,
    redirectUri,
    siteUrl,
    authBase: "https://api.youversion.com/auth",
    apiBase: process.env.YOUVERSION_API_BASE || "https://api.youversion.com/v1",
    scopes: process.env.YOUVERSION_SCOPES || "openid profile email",
  };
}
