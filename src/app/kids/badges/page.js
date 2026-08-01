"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function KidsBadgesPage() {
  const { activeChild, achievements, shareAchievement, copyShareLink, playSquish, playSuccess } = useApp();
  const [showShareToast, setShowShareToast] = useState("");

  // Set of all badges with metadata
  const BADGES_METADATA = [
    {
      name: "Kindness",
      subtitle: "The Good Samaritan",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4PYWp3SiM9l6wJvrBCNdqcBs6D2Y-hxAnk907a9QvjiQfIhzW-ZDQ_qPPoZVszgTBXmve83NfC4jBaIw5bFyxP2CrkS6xxy-9vCsBIYwxFpLGPISjcbwYhupfnHC4_iHL2tLiH_Og5SFEpZkMjTzzeHoPKrnE2nhIpBYuKoOkMQvJgxfwcFtvxrcXW9QBuybS8tpn1AvfoYLjxgG2G81FnUax3aGq3DcIiOrz5H-1M7Ybzx7mupBo6A",
      gradient: "from-primary-container to-secondary-container"
    },
    {
      name: "Faith",
      subtitle: "The Mustard Seed",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgRiWVWzpUL69a1bf5mQvP_b9uSzTgv8X5ObL-jScKKxSc06dfKX7r3ylkNe7HUYkC0CHTv3jSAjb1eiRRgbqYXeXCbexePgiTxUeVkrpLuOtBY6fY_W0YSmaU6VmGCIgudi_8wLDR4K009Wn1zAXJ-DxKHUNQvSrY66FoxWEDhw7VlpL7Uo7rLNy-Rwd3QaEkYThFc7vH1WthojTjytDFgwNhfm0sWzBUIiYPEZoHwFj8X4XhCk1YZg",
      gradient: "from-secondary-container to-tertiary-container"
    },
    {
      name: "Courage",
      subtitle: "David & Goliath",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWGOSFeEdk6T3Cl5E1HRKA68N-7K34fTAnXKY86WQaNcQoDsjEvPAnyCS84ed0j1KP-_dJiqli7qf4MuOprMvEBQUX86TrMAJUO2DYWPyoYVxUbwLcbfSIQC-kPlbvnjI_me-AxChbpNPeubgOYJqyqTZChnrKnxtbGOqLroK3CIAF-1wlrMEuQA13OTPW-RChzQjz4igD1ws-TiP8ttHcWYKL3KlfueP99ZiE7cxBXfyzaCunc35HlQ",
      gradient: "from-error-container to-primary-container"
    },
    {
      name: "Wisdom",
      subtitle: "Coming Soon!",
      image: "",
      gradient: "",
      lockedAlways: true
    }
  ];

  const handleShareClick = async () => {
    playSuccess();
    const latest = achievements.find(
      (a) => a.child_id === activeChild?.id && a.achievement_type === "badge"
    ) || achievements.find((a) => a.child_id === activeChild?.id);

    if (latest) {
      await shareAchievement(latest);
      setShowShareToast("Celebration link shared! Friends can see the milestone and join Bible Teddy.");
    } else if (childBadges.length > 0) {
      const token = achievements[0]?.share_token;
      if (token) await copyShareLink(token);
      setShowShareToast("Copy a celebration link from the Parent Dashboard after your next quest!");
    } else {
      setShowShareToast("Earn a badge first — then share your victory with family!");
    }
    setTimeout(() => setShowShareToast(""), 4000);
  };

  const childBadges = activeChild?.badges || ["Kindness", "Faith"];

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-md">
      <div className="max-w-5xl mx-auto">
        
        {/* Hero Header Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-lg mb-xl bg-surface-container-low p-lg rounded-xl neomorphic-card relative overflow-hidden border border-white mt-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="z-10 flex-1">
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-sm font-bold leading-tight">
              Hero Gallery
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-md max-w-md font-medium leading-relaxed">
              Look at all the light you've gathered, {activeChild?.name || "Explorer"}! Every badge shows a piece of your wonderful journey with Jesus.
            </p>
            <div className="flex gap-base">
              <button
                onClick={handleShareClick}
                className="bg-primary-container text-on-primary-container font-headline-md text-headline-md px-6 py-4 rounded-full soft-squish border-b-4 border-primary/20 hover:scale-105 transition-transform flex items-center gap-xs font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined">ios_share</span> Share with Family
              </button>
            </div>
          </div>
          
          {/* Mascot Celebrating */}
          <div className="z-10 relative">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full bg-white flex items-center justify-center p-base neomorphic-card animate-bounce duration-[2000ms] border border-surface-variant/30">
              <img
                alt="Mascot celebrating"
                className="w-full h-full object-contain"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
              />
            </div>
            
            {/* Streak Indicator */}
            <div className="absolute -bottom-4 -left-4 bg-white p-sm rounded-xl shadow-xl flex items-center gap-xs border-2 border-primary-container">
              <div className="sun-pulse bg-primary-container p-xs rounded-full shadow-inner flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-md" style={{ fontVariationSettings: "'FILL' 1" }}>
                  wb_sunny
                </span>
              </div>
              <div className="pr-xs select-none">
                <p className="text-[9px] font-bold uppercase tracking-widest text-primary">Streak</p>
                <p className="text-lg font-bold text-on-surface leading-tight">
                  {activeChild?.streak || 7} Days
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Badge Grid */}
        <section className="mb-xl">
          <div className="flex items-center justify-between mb-lg">
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-base font-bold">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              My Stained Glass Collection
            </h2>
            <button className="text-primary font-headline-md text-headline-md hover:underline font-bold cursor-pointer bg-transparent border-none">
              See All Badges
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-md md:gap-lg">
            {BADGES_METADATA.map((badge, idx) => {
              const isEarned = childBadges.includes(badge.name) && !badge.lockedAlways;
              
              if (!isEarned) {
                return (
                  <div key={idx} className="group cursor-not-allowed opacity-60">
                    <div className="aspect-square bg-surface-container-high rounded-xl p-md flex flex-col items-center justify-center border-2 border-dashed border-outline-variant grayscale">
                      <div className="w-2/3 aspect-square hex-clip bg-surface-container-highest mb-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-outline">lock</span>
                      </div>
                      <span className="font-headline-md text-headline-md text-outline font-bold">
                        {badge.name}
                      </span>
                      <span className="text-[10px] font-bold text-outline-variant uppercase">
                        {badge.subtitle}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="group cursor-pointer">
                  <div className="aspect-square bg-white rounded-xl neomorphic-card p-md flex flex-col items-center justify-center transition-all duration-500 group-hover:-translate-y-2 border border-surface-variant/20 shadow-md">
                    <div className={`w-2/3 aspect-square hex-clip bg-gradient-to-br ${badge.gradient} mb-sm flex items-center justify-center p-sm badge-glow`}>
                      <div className="w-full h-full bg-white/30 backdrop-blur-sm hex-clip flex items-center justify-center overflow-hidden border border-white/40">
                        <img className="w-full h-full object-cover" src={badge.image} alt={badge.name} />
                      </div>
                    </div>
                    <span className="font-headline-md text-headline-md text-primary font-bold">
                      {badge.name}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase">
                      {badge.subtitle}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Virtue Trackers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-lg select-none mb-xl">
          <div className="bg-white p-lg rounded-xl neomorphic-card border border-surface-variant/20 shadow-md">
            <h3 className="font-headline-md text-headline-md text-secondary mb-md font-bold">Faith Progress</h3>
            <div className="space-y-md">
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-caps text-label-caps text-on-surface-variant font-bold text-xs">Daily Prayers</span>
                  <span className="font-label-caps text-label-caps text-secondary font-bold text-xs">80%</span>
                </div>
                <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden border border-white">
                  <div className="h-full bg-secondary w-[80%] rounded-full shadow-[0_0_15px_rgba(12,103,128,0.5)]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-xs">
                  <span className="font-label-caps text-label-caps text-on-surface-variant font-bold text-xs">Story Listening</span>
                  <span className="font-label-caps text-label-caps text-secondary font-bold text-xs">
                    {activeChild?.progress?.david || 65}%
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden border border-white">
                  <div
                    className="h-full bg-secondary rounded-full shadow-[0_0_15px_rgba(12,103,128,0.5)] transition-all duration-500"
                    style={{ width: `${activeChild?.progress?.david || 65}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-lg rounded-xl neomorphic-card border border-surface-variant/20 shadow-md flex flex-col justify-between gap-md">
            <div>
              <h3 className="font-headline-md text-headline-md text-primary mb-sm font-bold">Music Sequencer Challenge</h3>
              <p className="font-body-md text-on-surface-variant font-medium">
                Tap notes matching the Psalm 23:1 verse block sequencer to unlock the <strong>Wisdom Badge</strong>!
              </p>
            </div>
            
            <Link
              href="/kids/music"
              onClick={playSquish}
              className="w-full py-4 bg-primary-container text-on-primary-container rounded-xl font-headline-md font-bold text-center squishy-button shadow-md block"
            >
              Try Scripture Sing-Along
            </Link>
          </div>
        </section>
      </div>

      {/* Share Toast popover */}
      {showShareToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-secondary text-white px-md py-sm rounded-full shadow-2xl z-50 animate-fade-in flex items-center gap-xs font-headline-md text-sm border border-white/20 select-none">
          <span className="material-symbols-outlined text-white">check_circle</span>
          {showShareToast}
        </div>
      )}
    </div>
  );
}
