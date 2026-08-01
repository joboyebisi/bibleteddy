import { NextResponse } from "next/server";
import { getYouVersionConfig } from "@/lib/youversion/config";

/**
 * GET /api/youversion/setup
 * Shows the exact callback URL registered at platform.youversion.com
 */
export async function GET(request) {
  const { origin } = new URL(request.url);
  const { redirectUri, siteUrl, appKey } = getYouVersionConfig(origin);
  const staleEnv = process.env.YOUVERSION_REDIRECT_URI;

  return NextResponse.json({
    siteUrl,
    redirectUri,
    appKeyConfigured: !!appKey,
    staleEnvOverride: staleEnv && staleEnv !== redirectUri ? staleEnv : null,
    note: staleEnv && staleEnv !== redirectUri
      ? "YOUVERSION_REDIRECT_URI in Vercel is ignored — delete it to avoid confusion"
      : null,
    instructions: [
      "Register this exact callback at https://platform.youversion.com:",
      redirectUri,
    ],
  });
}
