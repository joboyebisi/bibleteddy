import { NextResponse } from "next/server";
import { getYouVersionConfig } from "@/lib/youversion/config";

/**
 * GET /api/youversion/setup
 * Shows the exact callback URL to register at platform.youversion.com
 */
export async function GET(request) {
  const { origin } = new URL(request.url);
  const { redirectUri, siteUrl, appKey } = getYouVersionConfig({ origin });

  return NextResponse.json({
    siteUrl,
    redirectUri,
    appKeyConfigured: !!appKey,
    alternativeCallback: `${siteUrl}/onboarding/youversion/callback`,
    instructions: [
      "Go to https://platform.youversion.com",
      "Open your app → Callback URL",
      `Primary (recommended): ${siteUrl}/onboarding/youversion/callback`,
      `Or API route: ${redirectUri}`,
      "URLs must match exactly what is registered in the portal",
    ],
  });
}
