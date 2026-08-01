import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/siteUrl";

/**
 * GET /api/achievements/[token] — public achievement card (for share pages & OG)
 */
export async function GET(request, { params }) {
  const { token } = await params;
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const { data, error } = await supabase
    .from("achievement_shares")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
  }

  await supabase
    .from("achievement_shares")
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq("id", data.id);

  const siteUrl = getSiteUrl();

  return NextResponse.json({
    ...data,
    shareUrl: `${siteUrl}/share/${token}`,
    inviteUrl: `${siteUrl}/onboarding/signup?ref=${token}`,
  });
}
