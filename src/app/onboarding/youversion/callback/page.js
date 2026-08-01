"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Client-side OAuth callback page (alternative to /api/youversion/callback).
 * Handles hash fragments and forwards to the API route.
 * Register this URL in YouVersion if the API callback keeps failing:
 *   https://bibleteddy.vercel.app/onboarding/youversion/callback
 */
export default function YouVersionCallbackPage() {
  const [message, setMessage] = useState("Completing YouVersion sign in…");

  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
    const keys = ["code", "yvp_id", "user_email", "user_name", "profile_picture", "scope", "error"];

    let changed = false;
    keys.forEach((key) => {
      if (!url.searchParams.has(key) && hash.has(key)) {
        url.searchParams.set(key, hash.get(key));
        changed = true;
      }
    });

    if (changed) {
      url.hash = "";
      window.location.replace(`/api/youversion/callback?${url.searchParams.toString()}`);
      return;
    }

    if (url.searchParams.toString()) {
      window.location.replace(`/api/youversion/callback?${url.searchParams.toString()}`);
      return;
    }

    setMessage("No sign-in data received from YouVersion.");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-on-surface p-6">
      <p className="font-body-md text-lg">{message}</p>
      <Link href="/onboarding/login" className="text-primary font-bold underline">
        Back to login
      </Link>
    </div>
  );
}
