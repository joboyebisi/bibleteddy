import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/siteUrl";

/**
 * GET /api/auth/callback
 * Legacy Supabase redirect target — forwards to client page that reads hash tokens.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const siteUrl = getSiteUrl(origin);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/parent";
  const error = searchParams.get("error");

  if (error) {
    console.error("OAuth error:", error, searchParams.get("error_description"));
    return NextResponse.redirect(
      `${siteUrl}/onboarding/signup?error=${encodeURIComponent(error)}`
    );
  }

  // Server-side code exchange still works when code is in query string
  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    try {
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(`${siteUrl}/onboarding/signup?error=auth_failed`);
      }

      if (data?.user) {
        const { error: upsertError } = await supabase
          .from("parent_profiles")
          .upsert(
            {
              id: data.user.id,
              email: data.user.email,
              display_name:
                data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
            },
            { onConflict: "id" }
          );

        if (upsertError) {
          console.warn("Parent profile upsert error:", upsertError);
        }
      }

      return NextResponse.redirect(`${siteUrl}${next}`);
    } catch (err) {
      console.error("Auth callback error:", err);
      return NextResponse.redirect(`${siteUrl}/onboarding/signup?error=server_error`);
    }
  }

  // Magic links put tokens in #hash — client page must handle those
  const forward = new URLSearchParams(searchParams);
  if (!forward.has("next")) forward.set("next", next);
  return NextResponse.redirect(`${siteUrl}/onboarding/auth/callback?${forward.toString()}`);
}
