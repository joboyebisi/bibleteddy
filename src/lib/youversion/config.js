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
