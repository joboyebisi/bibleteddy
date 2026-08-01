"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function CurationWalkthroughPage() {
  const router = useRouter();
  const { addCuratedVideo, playSquish, playSuccess } = useApp();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sparkles background effect
  useEffect(() => {
    const interval = setInterval(() => {
      const sparkle = document.createElement("span");
      sparkle.className = "material-symbols-outlined sparkle-container text-primary-container pointer-events-none";
      sparkle.innerText = "auto_awesome";
      sparkle.style.fontSize = Math.random() * 20 + 10 + "px";
      sparkle.style.position = "fixed";
      sparkle.style.left = Math.random() * window.innerWidth + "px";
      sparkle.style.top = Math.random() * window.innerHeight + "px";
      sparkle.style.opacity = "0";
      sparkle.style.transition = "all 2s ease";
      sparkle.style.zIndex = "1";
      
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        sparkle.style.opacity = "0.6";
        sparkle.style.transform = `scale(1.5) rotate(${Math.random() * 180}deg)`;
      }, 100);
      
      setTimeout(() => {
        sparkle.style.opacity = "0";
        setTimeout(() => sparkle.remove(), 2000);
      }, 2000);
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const handleCurateSubmit = async (e) => {
    if (e) e.preventDefault();
    const url = youtubeUrl.trim();
    if (!url) {
      setErrorMsg("Please paste a valid YouTube URL first!");
      return;
    }
    if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
      setErrorMsg("Please enter a valid YouTube link (youtube.com or youtu.be)");
      return;
    }

    playSquish();
    setErrorMsg("");
    setIsGenerating(true);
    setGenProgress(0);
    setIsSuccess(false);

    // Simulated progress bar increment
    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleGenerationSuccess();
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const handleGenerationSuccess = async () => {
    try {
      await addCuratedVideo(url);
      setIsSuccess(true);
      playSuccess();
    } catch (err) {
      setErrorMsg("Could not parse video. Please check your network and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary-container selection:text-on-primary-container">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 backdrop-blur-xl bg-surface/80 shadow-[0_20px_20px_rgba(112,93,0,0.15)]">
        <Link href="/" className="font-display-lg-mobile md:font-display-lg text-primary tracking-tight font-bold">
          Bible Teddy
        </Link>
        <div className="flex items-center gap-md">
          <span className="material-symbols-outlined text-primary text-2xl cursor-pointer">help</span>
          <Link href="/onboarding/child">
            <span className="material-symbols-outlined text-primary text-2xl cursor-pointer">account_circle</span>
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-xl px-margin-mobile md:px-margin-desktop min-h-screen flex flex-col items-center stained-glass-bg flex-grow">
        {/* Progress Stepper */}
        <div className="w-full max-w-[600px] mb-lg px-md mt-md">
          <div className="flex items-center justify-between mb-xs">
            <span className="font-label-caps text-label-caps text-on-surface-variant font-bold text-xs">STEP 3 OF 3</span>
            <span className="font-label-caps text-label-caps text-primary font-bold text-xs font-bold">ALMOST THERE!</span>
          </div>
          <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden">
            <div className="h-full w-full bg-primary-container progress-glow transition-all duration-1000"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl w-full max-w-[1024px] items-center mt-4">
          {/* Content Curation Explaination (Bento Style) */}
          <div className="lg:col-span-7 space-y-md">
            <div className="p-lg rounded-xl soft-neomorphism relative overflow-hidden border border-white shadow-lg">
              {/* Glassmorphism Sparkle */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-container/20 rounded-full blur-xl"></div>
              
              <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-md font-bold leading-tight">
                Curate with Confidence
              </h1>
              
              <p className="font-body-lg text-on-surface-variant mb-lg leading-relaxed font-medium">
                Transform any YouTube video into a safe, engaging learning journey. Our AI companion reviews the content to ensure it's biblical and child-friendly.
              </p>

              {/* Input Tool */}
              <form onSubmit={handleCurateSubmit} className="space-y-sm">
                <label className="font-label-caps text-label-caps text-tertiary px-sm font-bold text-xs">
                  PASTE YOUTUBE URL
                </label>
                <div className="relative">
                  <textarea
                    className="w-full min-h-[88px] pl-12 pr-4 py-4 bg-surface-container-low border-2 border-outline-variant focus:border-secondary focus:ring-0 rounded-2xl font-body-md transition-all font-medium resize-y break-all"
                    placeholder="https://youtube.com/watch?v=..."
                    rows={3}
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={isGenerating}
                    required
                  />
                  <span className="absolute left-4 top-4 material-symbols-outlined text-on-surface-variant/40">
                    link
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 px-md bg-secondary text-white rounded-full font-bold flex items-center justify-center gap-xs cursor-pointer hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">magic_button</span>
                  Curate Video
                </button>

                {errorMsg && (
                  <p className="text-error font-body-md font-bold px-sm">{errorMsg}</p>
                )}

                {/* AI Generating State Mock */}
                {isGenerating && (
                  <div className="p-md bg-secondary-container/30 rounded-lg border-2 border-dashed border-secondary/20 flex flex-col gap-sm animate-pulse">
                    <div className="flex items-center gap-md">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">psychology</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-headline-md text-secondary-container-on text-body-md font-bold">
                          AI Generating Quiz... {genProgress}%
                        </h4>
                        <p className="text-label-caps text-tertiary text-xs font-bold">
                          Safe-check &amp; 3 comprehension questions
                        </p>
                      </div>
                    </div>
                    
                    <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary transition-all duration-300"
                        style={{ width: `${genProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Success Indicator */}
                {isSuccess && (
                  <div className="p-md bg-primary-container/20 rounded-lg border-2 border-primary/20 flex items-center gap-md animate-fade-in shadow-inner">
                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold shadow-md shrink-0">
                      <span className="material-symbols-outlined">check</span>
                    </div>
                    <div>
                      <h4 className="font-headline-md text-primary font-bold text-body-md">Quiz Generated Successfully!</h4>
                      <p className="text-body-md text-on-surface-variant font-medium">
                        Added to your Curated Stories list.
                      </p>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="p-md rounded-xl glass-glow flex gap-md border border-white shadow-sm">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-on-primary-container text-md">verified_user</span>
                </div>
                <div>
                  <p className="font-label-caps text-primary font-bold text-xs">SAFETY FIRST</p>
                  <p className="text-body-md font-medium text-xs text-on-surface-variant">
                    AI scans for sensitive words, theology consistency and age-safety themes.
                  </p>
                </div>
              </div>
              
              <div className="p-md rounded-xl glass-glow flex gap-md border border-white shadow-sm">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-on-secondary-container text-md">quiz</span>
                </div>
                <div>
                  <p className="font-label-caps text-secondary font-bold text-xs">SMART QUIZZES</p>
                  <p className="text-body-md font-medium text-xs text-on-surface-variant">
                    Questions adapt automatically to early reading levels and age groups.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mascot & Action Column */}
          <div className="lg:col-span-5 flex flex-col items-center gap-lg">
            <div className="relative">
              {/* Glow background for Mascot */}
              <div className="absolute inset-0 bg-primary-container/30 rounded-full blur-[60px]"></div>
              
              <img
                alt="Mascot waving"
                className="w-60 h-60 md:w-72 md:h-72 object-contain floating relative z-10 filter drop-shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
              />
              
              {/* Speech Bubble */}
              <div className="absolute -top-6 -right-6 md:-right-10 bg-white p-md rounded-xl shadow-lg border-2 border-primary-container max-w-[200px] z-20">
                <p className="font-body-md text-primary text-center font-bold text-xs leading-normal">
                  "You're all set! Let's start our adventure together!"
                </p>
              </div>
            </div>

            <div className="w-full space-y-md">
              <button
                onClick={() => {
                  playSquish();
                  router.push("/parent");
                }}
                className="squishy-button w-full h-20 bg-primary-container text-on-primary-container rounded-full font-headline-md text-xl flex items-center justify-center gap-md group transition-all cursor-pointer font-bold"
              >
                Go to Dashboard
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                  arrow_forward
                </span>
              </button>
              <p className="text-center font-label-caps text-tertiary font-bold text-xs">
                FREE TRIAL ENDS IN 14 DAYS
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-md bg-surface-container-low border-t border-surface-container/50">
        <div className="font-headline-md text-primary font-bold">Bible Teddy</div>
        <div className="flex flex-wrap justify-center gap-md">
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Privacy Policy
          </a>
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Terms of Service
          </a>
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Parent Support
          </a>
          <a className="font-label-caps text-label-caps text-tertiary hover:text-primary underline transition-colors font-bold" href="#">
            Contact Us
          </a>
        </div>
        <p className="font-label-caps text-label-caps text-secondary font-bold text-xs text-center md:text-right">
          &copy; 2026 Bible Teddy. Safe &amp; Wonder-filled Learning.
        </p>
      </footer>
    </div>
  );
}
