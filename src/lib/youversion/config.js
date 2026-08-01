export function getSiteUrl(origin) {
  if (origin) {
    return origin.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * @param {{ origin?: string }} [options] - Pass request origin for correct OAuth redirect on any host
 */
export function getYouVersionConfig(options = {}) {
  const appKey =
    process.env.YOUVERSION_APP_KEY ||
    process.env.YVP_APP_KEY ||
    process.env.YOUVERSION_API_TOKEN;

  const siteUrl = getSiteUrl(options.origin);
  const redirectUri =
    process.env.YOUVERSION_REDIRECT_URI ||
    `${siteUrl}/api/youversion/callback`;

  return {
    appKey,
    redirectUri,
    siteUrl,
    authBase: "https://api.youversion.com/auth",
    apiBase: process.env.YOUVERSION_API_BASE || "https://api.youversion.com/v1",
    scopes: process.env.YOUVERSION_SCOPES || "openid profile email",
  };
}
