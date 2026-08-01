import { getSiteUrl } from "@/lib/siteUrl";

/**
 * @param {string} [fallbackOrigin]
 */
export function getYouVersionConfig(fallbackOrigin) {
  const appKey =
    process.env.YOUVERSION_APP_KEY ||
    process.env.YVP_APP_KEY ||
    process.env.YOUVERSION_API_TOKEN;

  const siteUrl = getSiteUrl(fallbackOrigin);
  // Always use the page callback — must match platform.youversion.com registration.
  // (Ignores YOUVERSION_REDIRECT_URI so a stale Vercel env cannot break OAuth.)
  const redirectUri = `${siteUrl}/onboarding/youversion/callback`;

  return {
    appKey,
    redirectUri,
    siteUrl,
    authBase: "https://api.youversion.com/auth",
    apiBase: process.env.YOUVERSION_API_BASE || "https://api.youversion.com/v1",
    scopes: process.env.YOUVERSION_SCOPES || "openid profile email",
  };
}
