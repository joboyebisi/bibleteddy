/**
 * One-time admin account setup for Supabase.
 *
 * Usage (never commit passwords to git):
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword npm run seed:admin
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const displayName = process.env.ADMIN_DISPLAY_NAME || "Admin";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

if (!email || !password) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.");
  console.error("Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret npm run seed:admin");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: displayName, role: "admin" },
});

if (error && !error.message.includes("already been registered") && !error.message.includes("already exists")) {
  console.error("Failed to create admin:", error.message);
  process.exit(1);
}

let userId = data?.user?.id;

if (!userId) {
  const { data: linkData } = await supabase.auth.admin.generateLink({ type: "magiclink", email });
  userId = linkData?.user?.id;
}

if (!userId) {
  console.error("Could not resolve user id for", email);
  process.exit(1);
}

const { error: profileError } = await supabase.from("parent_profiles").upsert(
  {
    id: userId,
    email,
    display_name: displayName,
    is_admin: true,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" }
);

if (profileError) {
  console.error("Profile upsert failed:", profileError.message);
  console.error("Run in Supabase SQL Editor: ALTER TABLE parent_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;");
  process.exit(1);
}

console.log("Admin ready:", email);
console.log("Sign in at /onboarding/login with email + password");
