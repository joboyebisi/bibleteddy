export function getYouVersionConfig() {
  const appKey =
    process.env.YOUVERSION_APP_KEY ||
    process.env.YVP_APP_KEY ||
    process.env.YOUVERSION_API_TOKEN;

  const redirectUri =
    process.env.YOUVERSION_REDIRECT_URI ||
    `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/youversion/callback`;

  return {
    appKey,
    redirectUri,
    authBase: "https://api.youversion.com/auth",
    apiBase: process.env.YOUVERSION_API_BASE || "https://api.youversion.com/v1",
    scopes: process.env.YOUVERSION_SCOPES || "openid profile email",
  };
}
