import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getYouVersionConfig } from "@/lib/youversion/config";

const OAUTH_COOKIE_NAMES = [
  "yv_code_verifier",
  "yv_oauth_state",
  "yv_oauth_nonce",
  "yv_oauth_next",
  "yv_redirect_uri",
  "yv_user_email",
  "yv_user_name",
  "yv_yvp_id",
  "yv_profile_picture",
];

function clearOAuthCookies(cookieStore) {
  for (const name of OAUTH_COOKIE_NAMES) {
    cookieStore.delete(name);
  }
}

/**
 * GET /api/youversion/callback
 * YouVersion OAuth — two browser hops:
 *   1) yvp_id + user info → redirect browser to YouVersion /auth/callback
 *   2) code + state → exchange for tokens, create Supabase session
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const cookieStore = await cookies();
  const storedState = cookieStore.get("yv_oauth_state")?.value;
  const codeVerifier = cookieStore.get("yv_code_verifier")?.value;
  const storedRedirectUri = cookieStore.get("yv_redirect_uri")?.value;
  const next = cookieStore.get("yv_oauth_next")?.value || "/parent";

  const { appKey, redirectUri: configRedirectUri, authBase } = getYouVersionConfig({ origin });
  const redirectUri = storedRedirectUri || configRedirectUri;

  const error = searchParams.get("error");
  if (error) {
    clearOAuthCookies(cookieStore);
    const hint =
      error === "invalid_request"
        ? ` Register this callback at platform.youversion.com: ${redirectUri}`
        : "";
    return NextResponse.redirect(
      `${origin}/onboarding/signup?error=${encodeURIComponent(error)}&hint=${encodeURIComponent(hint)}`
    );
  }

  const returnedState = searchParams.get("state");
  if (!storedState || !returnedState || storedState !== returnedState) {
    clearOAuthCookies(cookieStore);
    return NextResponse.redirect(`${origin}/onboarding/signup?error=invalid_state`);
  }

  if (!codeVerifier || !appKey) {
    clearOAuthCookies(cookieStore);
    return NextResponse.redirect(`${origin}/onboarding/signup?error=oauth_config`);
  }

  const authCode = searchParams.get("code");
  const yvpId = searchParams.get("yvp_id");
  const userEmail = searchParams.get("user_email") || cookieStore.get("yv_user_email")?.value;
  const userName = searchParams.get("user_name") || cookieStore.get("yv_user_name")?.value;
  const profilePicture =
    searchParams.get("profile_picture") || cookieStore.get("yv_profile_picture")?.value;
  const youversionUserId = yvpId || cookieStore.get("yv_yvp_id")?.value;

  try {
    // ── Hop 1: YouVersion returned user info — browser must hit /auth/callback ──
    if (!authCode && yvpId) {
      const cookieOpts = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600,
        path: "/",
      };

      if (userEmail) cookieStore.set("yv_user_email", userEmail, cookieOpts);
      if (userName) cookieStore.set("yv_user_name", userName, cookieOpts);
      if (youversionUserId) cookieStore.set("yv_yvp_id", youversionUserId, cookieOpts);
      if (profilePicture) cookieStore.set("yv_profile_picture", profilePicture, cookieOpts);

      const callbackParams = new URLSearchParams({
        state: returnedState,
        yvp_id: yvpId,
        user_name: userName || "",
        user_email: userEmail || "",
        profile_picture: profilePicture || "",
      });

      // Auth Call 2: browser redirect (server-side fetch does not receive the code)
      return NextResponse.redirect(`${authBase}/callback?${callbackParams.toString()}`);
    }

    // ── Hop 2: authorization code received — exchange for tokens ──
    if (!authCode) {
      console.error("YouVersion callback missing code and yvp_id", Object.fromEntries(searchParams));
      clearOAuthCookies(cookieStore);
      return NextResponse.redirect(`${origin}/onboarding/signup?error=no_auth_code`);
    }

    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirectUri,
      client_id: appKey,
      code_verifier: codeVerifier,
    });

    const tokenRes = await fetch(`${authBase}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: tokenBody.toString(),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("YouVersion token exchange failed:", tokenRes.status, errText);
      clearOAuthCookies(cookieStore);
      return NextResponse.redirect(`${origin}/onboarding/signup?error=token_exchange_failed`);
    }

    clearOAuthCookies(cookieStore);

    const tokens = await tokenRes.json();
    const userInfo = decodeJwtPayload(tokens.id_token || tokens.access_token) || {};

    const email = userEmail || userInfo.email;
    const displayName = userName || userInfo.name || email?.split("@")[0] || "Parent";
    const finalYvpId = youversionUserId || userInfo.yvp_id || userInfo.sub;

    if (!email) {
      return NextResponse.redirect(`${origin}/onboarding/signup?error=no_email`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      const demoParams = new URLSearchParams({
        yv_linked: "1",
        yv_email: email,
        yv_name: displayName,
        yv_id: finalYvpId || "",
      });
      return NextResponse.redirect(`${origin}${next}?${demoParams.toString()}`);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const tempPassword = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: profilePicture || userInfo.profile_picture,
        youversion_user_id: finalYvpId,
      },
    });

    const authUser = createData?.user;
    const userExists =
      createError &&
      (createError.message?.includes("already been registered") ||
        createError.message?.includes("already exists"));

    if (createError && !userExists) {
      console.error("Supabase createUser error:", createError);
      return NextResponse.redirect(`${origin}/onboarding/signup?error=account_create_failed`);
    }

    let profileUserId = authUser?.id;
    if (!profileUserId) {
      const { data: linkCheck } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });
      profileUserId = linkCheck?.user?.id;
    }

    if (profileUserId) {
      await supabase.from("parent_profiles").upsert(
        {
          id: profileUserId,
          email,
          display_name: displayName,
          youversion_user_id: finalYvpId,
          youversion_access_token: tokens.access_token,
          youversion_refresh_token: tokens.refresh_token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("Magic link error:", linkError);
      return NextResponse.redirect(`${origin}/onboarding/signup?error=session_failed`);
    }

    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${linkData.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${origin}/api/auth/callback?next=${encodeURIComponent(next)}`)}`;

    return NextResponse.redirect(verifyUrl);
  } catch (err) {
    console.error("YouVersion callback error:", err);
    clearOAuthCookies(cookieStore);
    return NextResponse.redirect(`${origin}/onboarding/signup?error=server_error`);
  }
}

function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = Buffer.from(parts[1], "base64url").toString("utf8");
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
