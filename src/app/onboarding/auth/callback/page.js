"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const finish = async () => {
      const next = searchParams.get("next") || "/parent";
      const error = searchParams.get("error");

      if (error) {
        router.replace(`/onboarding/signup?error=${encodeURIComponent(error)}`);
        return;
      }

      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      // PKCE / OAuth code in query string
      const code = searchParams.get("code");
      if (code) {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.error("exchangeCodeForSession:", exchangeError);
          router.replace("/onboarding/signup?error=auth_failed");
          return;
        }
        if (data.user) {
          await supabase.from("parent_profiles").upsert(
            {
              id: data.user.id,
              email: data.user.email,
              display_name:
                data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
            },
            { onConflict: "id" }
          );
        }
        router.replace(next);
        return;
      }

      // Magic link tokens in URL hash (#access_token=…)
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) {
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get("access_token");
        const refresh_token = hashParams.get("refresh_token");

        if (access_token && refresh_token) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) {
            console.error("setSession:", sessionError);
            router.replace("/onboarding/signup?error=auth_failed");
            return;
          }
          if (data.user) {
            await supabase.from("parent_profiles").upsert(
              {
                id: data.user.id,
                email: data.user.email,
                display_name:
                  data.user.user_metadata?.full_name || data.user.email?.split("@")[0],
              },
              { onConflict: "id" }
            );
          }
          window.history.replaceState({}, "", window.location.pathname + window.location.search);
          router.replace(next);
          return;
        }
      }

      // Already has session (e.g. refreshed)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(next);
        return;
      }

      setMessage("Could not complete sign in. Please try again.");
    };

    finish();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-on-surface p-6">
      <p className="font-body-md text-lg">{message}</p>
      <Link href="/onboarding/login" className="text-primary font-bold underline">
        Back to login
      </Link>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p>Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
