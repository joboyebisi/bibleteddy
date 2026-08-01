"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { buildAchievementCopy } from "@/lib/achievements";

export default function ShareAchievementClient({ token }) {
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/achievements/${token}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setAchievement(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleCopy = async () => {
    if (!achievement?.shareUrl) return;
    try {
      await navigator.clipboard.writeText(achievement.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffde7]">
        <p className="font-bold text-[#705d00]">Loading celebration…</p>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#fffde7] p-6 text-center">
        <p className="text-4xl">🧸</p>
        <h1 className="text-xl font-black text-[#3d3300]">Achievement not found</h1>
        <p className="text-sm text-[#544600] max-w-md">This link may have expired, or the celebration was saved on another device.</p>
        <Link href="/onboarding/signup" className="px-6 py-3 rounded-full bg-[#ffd700] font-black text-[#3d3300] border border-[#e9c400]">
          Start Your Family Adventure
        </Link>
      </div>
    );
  }

  const social = buildAchievementCopy(achievement.achievement_type, {
    childName: achievement.child_name,
    storyTitle: achievement.story_title,
    checkpointTitle: achievement.metadata?.checkpointTitle,
    verseReference: achievement.metadata?.verseReference,
    badgeName: achievement.metadata?.badgeName,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffde7] to-[#fbf9f5] px-4 py-10">
      <div className="max-w-lg mx-auto space-y-8">
        {/* Achievement card */}
        <div className="rounded-3xl border-4 border-[#e9c400] bg-white p-8 text-center shadow-xl">
          <p className="text-6xl mb-4">{achievement.emoji || "🌟"}</p>
          <p className="text-xs font-black uppercase tracking-widest text-[#0c6780] mb-2">Faith Milestone</p>
          <h1 className="text-2xl font-black text-[#3d3300] leading-tight mb-2">{achievement.title}</h1>
          <p className="text-sm font-medium text-[#544600] italic">{achievement.subtitle}</p>
          {achievement.seeds_earned > 0 && (
            <p className="mt-4 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#ffe16d] text-xs font-black text-[#705d00] border border-[#e9c400]">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              +{achievement.seeds_earned} Faith Seeds
            </p>
          )}
        </div>

        {/* Invite funnel */}
        <div className="rounded-3xl border-2 border-[#d0c6ab] bg-white p-6 space-y-4">
          <div className="flex items-center gap-3">
            <img
              alt="Bible Teddy"
              className="w-14 h-14 object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
            />
            <div className="text-left">
              <h2 className="text-lg font-black text-[#3d3300]">Want this for your family?</h2>
              <p className="text-xs font-medium text-[#544600]">{social.socialDescription}</p>
            </div>
          </div>

          <Link
            href={achievement.inviteUrl || `/onboarding/signup?ref=${token}`}
            className="block w-full py-4 rounded-2xl text-center font-black text-[#3d3300] border-2 border-[#e9c400] squishy-button"
            style={{ background: "linear-gradient(135deg,#ffd700,#f5c800)" }}
          >
            Start Your Family&apos;s Bible Adventure — Free
          </Link>

          <p className="text-[10px] font-bold text-center text-[#705d00]">
            YouVersion login • Kid-safe quests • AI memory verses • Parent dashboard
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-xl text-xs font-black border border-[#d0c6ab] text-[#544600] hover:bg-[#f5f3ef] cursor-pointer"
            >
              {copied ? "Link copied!" : "Copy celebration link"}
            </button>
            <Link
              href="/"
              className="flex-1 py-2.5 rounded-xl text-xs font-black text-center border border-[#d0c6ab] text-[#544600] hover:bg-[#f5f3ef]"
            >
              See how it works
            </Link>
          </div>
        </div>

        <p className="text-center text-[10px] font-bold text-[#705d00]/70">
          Powered by YouVersion Platform API &amp; Gloo AI Studio
        </p>
      </div>
    </div>
  );
}
