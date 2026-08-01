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
    instructions: [
      "Go to https://platform.youversion.com",
      "Open your app → Callback URL",
      `Register this URL exactly: ${redirectUri}`,
      "Save, then redeploy if you changed Vercel env vars",
    ],
  });
}
