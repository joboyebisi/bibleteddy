import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getYouVersionConfig } from "@/lib/youversion/config";

/**
 * GET /api/youversion/callback
 * Handles YouVersion OAuth redirect (Auth Call 2 + 3), links/creates Supabase user
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
    const hint =
      error === "invalid_request"
        ? ` Register this callback at platform.youversion.com: ${redirectUri}`
        : "";
    return NextResponse.redirect(
      `${origin}/onboarding/signup?error=${encodeURIComponent(error)}&hint=${encodeURIComponent(hint)}`
    );
  }

  // Clear OAuth cookies
  ["yv_code_verifier", "yv_oauth_state", "yv_oauth_nonce", "yv_oauth_next", "yv_redirect_uri"].forEach((name) => {
    cookieStore.delete(name);
  });

  const returnedState = searchParams.get("state");
  if (!storedState || !returnedState || storedState !== returnedState) {
    return NextResponse.redirect(`${origin}/onboarding/signup?error=invalid_state`);
  }

  if (!codeVerifier || !appKey) {
    return NextResponse.redirect(`${origin}/onboarding/signup?error=oauth_config`);
  }

  // Step 2: If we received user info directly (first redirect from YouVersion)
  const yvpId = searchParams.get("yvp_id");
  const userEmail = searchParams.get("user_email");
  const userName = searchParams.get("user_name");
  const profilePicture = searchParams.get("profile_picture");

  let authCode = searchParams.get("code");

  try {
    // Auth Call 2: Exchange user info for authorization code (if not already present)
    if (!authCode && yvpId) {
      const callbackParams = new URLSearchParams({
        state: returnedState,
        yvp_id: yvpId,
        user_name: userName || "",
        user_email: userEmail || "",
        profile_picture: profilePicture || "",
      });

      const callbackRes = await fetch(`${authBase}/callback?${callbackParams.toString()}`, {
        redirect: "manual",
      });

      const location = callbackRes.headers.get("location");
      if (location) {
        const locUrl = new URL(location, origin);
        authCode = locUrl.searchParams.get("code");
      }
    }

    if (!authCode) {
      console.error("YouVersion: no authorization code received");
      return NextResponse.redirect(`${origin}/onboarding/signup?error=no_auth_code`);
    }

    // Auth Call 3: Exchange code for tokens
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
      return NextResponse.redirect(`${origin}/onboarding/signup?error=token_exchange_failed`);
    }

    const tokens = await tokenRes.json();
    const userInfo = decodeJwtPayload(tokens.id_token || tokens.access_token) || {};

    const email = userEmail || userInfo.email;
    const displayName = userName || userInfo.name || email?.split("@")[0] || "Parent";
    const youversionUserId = yvpId || userInfo.yvp_id || userInfo.sub;

    if (!email) {
      return NextResponse.redirect(`${origin}/onboarding/signup?error=no_email`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      // Demo mode: redirect with YouVersion info in query (localStorage pickup)
      const demoParams = new URLSearchParams({
        yv_linked: "1",
        yv_email: email,
        yv_name: displayName,
        yv_id: youversionUserId || "",
      });
      return NextResponse.redirect(`${origin}${next}?${demoParams.toString()}`);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Create Supabase user if new, or continue if email already registered
    const tempPassword = `${crypto.randomUUID()}${crypto.randomUUID()}`;
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        avatar_url: profilePicture || userInfo.profile_picture,
        youversion_user_id: youversionUserId,
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

    // Resolve user id for profile upsert (new user or existing email)
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
          youversion_user_id: youversionUserId,
          youversion_access_token: tokens.access_token,
          youversion_refresh_token: tokens.refresh_token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    // Generate magic link session for the user
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error("Magic link error:", linkError);
      return NextResponse.redirect(`${origin}/onboarding/signup?error=session_failed`);
    }

    // Redirect through Supabase verify to establish session
    const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${linkData.properties.hashed_token}&type=magiclink&redirect_to=${encodeURIComponent(`${origin}/api/auth/callback?next=${encodeURIComponent(next)}`)}`;

    return NextResponse.redirect(verifyUrl);
  } catch (err) {
    console.error("YouVersion callback error:", err);
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
