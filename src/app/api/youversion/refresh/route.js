import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getYouVersionConfig } from "@/lib/youversion/config";

/**
 * POST /api/youversion/refresh
 * Refresh an expired YouVersion access token using stored refresh token
 */
export async function POST(request) {
  const { appKey, authBase } = getYouVersionConfig();
  if (!appKey) {
    return NextResponse.json({ error: "YOUVERSION_APP_KEY not configured" }, { status: 500 });
  }

  const { parentId, refreshToken } = await request.json();
  const tokenToUse = refreshToken;

  if (!tokenToUse) {
    return NextResponse.json({ error: "refreshToken required" }, { status: 400 });
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokenToUse,
    client_id: appKey,
  });

  const res = await fetch(`${authBase}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
  }

  const tokens = await res.json();

  // Persist refreshed tokens if parentId provided and Supabase configured
  if (parentId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    await supabase
      .from("parent_profiles")
      .update({
        youversion_access_token: tokens.access_token,
        youversion_refresh_token: tokens.refresh_token || tokenToUse,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parentId);
  }

  return NextResponse.json({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
  });
}
