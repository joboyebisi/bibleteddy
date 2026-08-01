import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateCodeVerifier, generateCodeChallenge, generateRandomString } from "@/lib/youversion/pkce";
import { getYouVersionConfig } from "@/lib/youversion/config";

/**
 * GET /api/youversion/login
 * Starts YouVersion OAuth PKCE flow — redirects to login.youversion.com
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const { appKey, redirectUri, authBase, scopes, siteUrl } = getYouVersionConfig();

  if (!appKey) {
    const next = searchParams.get("next") || "/parent";
    return NextResponse.redirect(
      `${siteUrl}/onboarding/signup?error=youversion_not_configured&hint=Set+YOUVERSION_APP_KEY+in+env`
    );
  }
  const next = searchParams.get("next") || "/parent";

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateRandomString();
  const nonce = generateRandomString();

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  };

  cookieStore.set("yv_code_verifier", codeVerifier, cookieOpts);
  cookieStore.set("yv_oauth_state", state, cookieOpts);
  cookieStore.set("yv_oauth_nonce", nonce, cookieOpts);
  cookieStore.set("yv_oauth_next", next, cookieOpts);
  cookieStore.set("yv_redirect_uri", redirectUri, cookieOpts);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: appKey,
    redirect_uri: redirectUri,
    scope: scopes,
    nonce,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    require_user_interaction: "true",
  });

  return NextResponse.redirect(`${authBase}/authorize?${params.toString()}`);
}
