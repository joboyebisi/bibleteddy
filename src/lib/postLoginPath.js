import { supabase } from "@/lib/supabaseClient";

/**
 * Returning users with child profiles go to the parent dashboard.
 * First-time users continue to child onboarding (or requested next path).
 */
export async function resolvePostLoginPath(userId, requestedNext = "/parent") {
  if (!userId) {
    return requestedNext?.startsWith("/") ? requestedNext : "/onboarding/child";
  }

  if (!supabase) {
    return requestedNext === "/onboarding/child" ? "/onboarding/child" : "/parent";
  }

  const { count, error } = await supabase
    .from("child_profiles")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", userId);

  if (!error && (count ?? 0) > 0) {
    return "/parent";
  }

  if (requestedNext?.startsWith("/")) {
    return requestedNext;
  }

  return "/onboarding/child";
}
