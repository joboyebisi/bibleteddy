import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/auth/callback
 * Handles OAuth callback from Supabase (Google login, YouVersion via OAuth)
 * Supabase redirects here after successful authentication
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/parent";
  const error = searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(`${origin}/onboarding/signup?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(`${origin}/onboarding/signup?error=auth_failed`);
      }

      if (data?.user) {
        // Ensure parent profile exists in database
        const { error: upsertError } = await supabase
          .from("parent_profiles")
          .upsert({
            id: data.user.id,
            email: data.user.email,
            display_name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
          }, { onConflict: "id" });

        if (upsertError) {
          console.warn("Parent profile upsert error:", upsertError);
        }
      }

      // Redirect to parent dashboard or next URL
      return NextResponse.redirect(`${origin}${next}`);
    } catch (err) {
      console.error("Auth callback error:", err);
      return NextResponse.redirect(`${origin}/onboarding/signup?error=server_error`);
    }
  }

  return NextResponse.redirect(`${origin}/onboarding/signup`);
}
