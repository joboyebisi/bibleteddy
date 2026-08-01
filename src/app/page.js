"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function LandingPage() {
  const router = useRouter();
  const { playSquish, parent } = useApp();

  // Parent Gate state
  const [showGate, setShowGate] = useState(false);
  const [gateAnswer, setGateAnswer] = useState("");
  const [gateError, setGateError] = useState(false);
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(8);

  const openParentGate = () => {
    playSquish();
    const n1 = Math.floor(Math.random() * 5) + 5; // 5-9
    const n2 = Math.floor(Math.random() * 5) + 5; // 5-9
    setNum1(n1);
    setNum2(n2);
    setGateAnswer("");
    setGateError(false);
    setShowGate(true);
  };

  const handleVerifyGate = (e) => {
    e.preventDefault();
    const correct = num1 * num2;
    if (parseInt(gateAnswer) === correct) {
      setShowGate(false);
      router.push(parent ? "/parent" : "/onboarding/signup");
    } else {
      setGateError(true);
      setTimeout(() => setGateError(false), 1500);
    }
  };

  return (
    <div className="bg-background text-on-background stained-glass-bg min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 flex justify-between items-center px-margin-mobile py-sm md:px-margin-desktop md:py-md bg-surface/80 backdrop-blur-xl transition-all duration-300">
        <div className="flex items-center gap-base">
          <span className="font-display-lg text-display-lg-mobile text-primary drop-shadow-sm font-bold">
            Bible Teddy
          </span>
        </div>
        <nav className="hidden md:flex gap-lg">
          <Link
            href="/"
            className="text-primary border-b-4 border-primary rounded-full px-4 py-1 font-body-lg font-bold hover:scale-105 transition-transform"
          >
            Home
          </Link>
          <Link
            href="/kids"
            className="text-on-surface-variant hover:text-primary transition-colors font-body-lg font-bold hover:scale-105 transition-transform"
          >
            Explore Stories
          </Link>
          <button
            onClick={openParentGate}
            className="text-on-surface-variant hover:text-primary transition-colors font-body-lg font-bold hover:scale-105 transition-transform text-left cursor-pointer"
          >
            Dashboard
          </button>
        </nav>
        <div className="flex items-center gap-sm">
          <button
            onClick={openParentGate}
            className="hidden md:flex items-center gap-xs text-on-surface-variant font-label-caps text-label-caps hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-md">lock</span> Parent Gate
          </button>
          
          <Link href={parent ? "/parent" : "/onboarding/signup"}>
            <span className="material-symbols-outlined text-primary text-3xl cursor-pointer hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_circle
            </span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="pt-24 flex-grow">
        {/* Hero Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-xl flex flex-col md:flex-row items-center justify-between gap-xl max-w-6xl mx-auto">
          <div className="w-full md:w-1/2 flex flex-col gap-md text-center md:text-left">
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-background font-bold leading-tight">
              Faith is more than just <span className="text-primary italic">watching.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl font-medium">
              Turn screen time into prayer time with Bible Teddy. Let your little ones interact with God's word through a voice-guided, huggable adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-md mt-sm items-center justify-center md:justify-start">
              <button
                onClick={() => {
                  playSquish();
                  router.push("/onboarding/signup");
                }}
                className="squish-btn bg-primary-container text-on-primary-container font-headline-md text-headline-md px-10 py-5 rounded-full w-full sm:w-auto font-bold shadow-lg hover:brightness-105 cursor-pointer"
              >
                Get Started (For Parents)
              </button>
              <div className="flex items-center gap-xs text-on-surface-variant font-body-md text-body-md font-medium">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                Parental Dashboard Included
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-5/12 relative flex justify-center items-center">
            <div className="absolute inset-0 bg-secondary-container/20 blur-3xl rounded-full scale-125"></div>
            <div className="relative w-full aspect-square max-w-[400px] flex items-center justify-center">
              <img
                alt="Bible Teddy Mascot"
                className="w-full h-full object-contain floating z-10 filter drop-shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
              />
              {/* Glass Orbs for aesthetic depth */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-fixed/20 backdrop-blur-md rounded-full border border-white/40"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-fixed/25 backdrop-blur-md rounded-full border border-white/30"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-xl bg-surface-container-low rounded-t-xl md:rounded-t-[4rem]">
          <div className="max-w-6xl mx-auto flex flex-col gap-xl">
            <div className="text-center space-y-base">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block font-bold">
                Why Bible Teddy?
              </span>
              <h2 className="font-display-lg text-display-lg-mobile md:text-headline-md text-on-surface font-bold">
                Designed for Tiny Hearts
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {/* Feature 1: Active Engagement */}
              <div className="bg-white p-lg rounded-lg soft-neomorphism flex flex-col gap-md items-center text-center group hover:scale-[1.02] transition-transform duration-300">
                <div className="w-20 h-20 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-inner">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    play_circle
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Active Engagement</h3>
                <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                  Interactive videos that stop to ask questions, keeping children focused and involved in the biblical narrative.
                </p>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden mt-sm">
                  <div className="h-full bg-primary-container w-2/3 shadow-[0_0_10px_#ffd700]"></div>
                </div>
              </div>
              
              {/* Feature 2: Scripture Fluency */}
              <div className="bg-white p-lg rounded-lg soft-neomorphism flex flex-col gap-md items-center text-center group hover:scale-[1.02] transition-transform duration-300">
                <div className="w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-inner">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    menu_book
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Scripture Fluency</h3>
                <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                  Direct YouVersion integration allows kids to memorize verses seamlessly through fun games and visual cues.
                </p>
                <div className="flex gap-xs mt-sm">
                  <div className="w-8 h-8 rounded-full bg-tertiary-container border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-secondary-container border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-primary-container border-2 border-white"></div>
                </div>
              </div>
              
              {/* Feature 3: Voice Match */}
              <div className="bg-white p-lg rounded-lg soft-neomorphism flex flex-col gap-md items-center text-center group hover:scale-[1.02] transition-transform duration-300">
                <div className="w-20 h-20 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-inner">
                  <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    mic
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary font-bold">Voice Match</h3>
                <p className="font-body-md text-body-md text-on-surface-variant font-medium">
                  Speak verses out loud! Our AI listens and encourages children with gentle feedback as they recite the Word.
                </p>
                <div className="flex items-center gap-xs mt-sm text-secondary animate-pulse">
                  <span className="material-symbols-outlined text-md">graphic_eq</span>
                  <span className="font-label-caps text-xs font-bold">Listening for Joy...</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Bento Section */}
        <section className="px-margin-mobile md:px-margin-desktop py-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-6xl mx-auto">
            <div className="md:col-span-8 bg-white p-lg rounded-lg soft-neomorphism relative overflow-hidden h-[400px]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBNakkhLF2rxpTBkS9LSrWyDrCN6QhcGnchfnkSqlchzyislYOIZjIi-Mc3PLdCYC8IKQYi3Ocpm8Bqk5RMinZdHIuzj6SmgOFNnSLOpaBNwP9UDohjz7E1SQnSow_VD5DT_eVJ9CX3DInveN_TXAgPpffPo2SXkAAFqXSvbvoAtrW7f7MvznHyIsD9pNDfxZ9ZNfX1BIbCCwcBoJC-fa6GKr711rdNZiYbhj9m2Rz4oFc3E-z9mF3OuA')",
                }}
              ></div>
              <div className="relative z-10 h-full flex flex-col justify-end">
                <h2 className="font-display-lg-mobile md:text-display-lg text-primary font-bold">Safe Haven Stories</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md font-medium">
                  Every story is vetted by theologians and child psychologists for safety and spiritual growth.
                </p>
              </div>
              <div className="absolute top-6 right-6">
                <span className="material-symbols-outlined text-primary text-5xl opacity-30">auto_awesome</span>
              </div>
            </div>
            
            <div className="md:col-span-4 bg-secondary text-on-secondary p-lg rounded-lg soft-neomorphism flex flex-col justify-between">
              <div className="space-y-base">
                <span className="material-symbols-outlined text-4xl">format_image_left</span>
                <h3 className="font-headline-md text-headline-md font-bold">100% Ad-Free</h3>
                <p className="font-body-md text-body-md text-on-secondary/80 font-medium">
                  No distractions, no trackers. Just pure faith and fun for your little explorers.
                </p>
              </div>
              <button className="mt-md px-4 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all font-label-caps font-bold border border-white/10 hover:scale-102 cursor-pointer">
                Learn About Safety
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg px-margin-mobile md:px-margin-desktop flex flex-col items-center gap-md text-center bg-surface-container-high rounded-t-xl mt-xl">
        <div className="flex flex-col items-center gap-xs">
          <span className="font-headline-md text-primary font-bold">Bible Teddy</span>
          <p className="text-on-surface-variant font-label-caps text-label-caps font-bold">Growing in Faith Together</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-md">
          <a className="text-on-surface-variant/80 hover:text-primary transition-all font-label-caps text-label-caps font-bold underline" href="#">
            About Us
          </a>
          <a className="text-on-surface-variant/80 hover:text-primary transition-all font-label-caps text-label-caps font-bold underline" href="#">
            Safety Guide
          </a>
          <a className="text-on-surface-variant/80 hover:text-primary transition-all font-label-caps text-label-caps font-bold underline" href="#">
            Support
          </a>
          <a className="text-on-surface-variant/80 hover:text-primary transition-all font-label-caps text-label-caps font-bold underline" href="#">
            Privacy
          </a>
        </nav>
        <p className="text-on-surface-variant font-label-caps text-[12px] opacity-60 font-bold">
          &copy; 2026 Bible Teddy - Growing in Faith Together
        </p>
      </footer>

      {/* Parent Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-sm animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-xl p-md md:p-lg max-w-sm w-full soft-neomorph border border-outline-variant/30 flex flex-col gap-md text-center">
            <div className="flex justify-between items-start">
              <span className="material-symbols-outlined text-secondary text-4xl">lock</span>
              <button
                onClick={() => setShowGate(false)}
                className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:scale-115 transition-transform"
              >
                close
              </button>
            </div>
            
            <div className="space-y-xs">
              <h2 className="font-display-lg-mobile text-primary font-bold">Parent Gate</h2>
              <p className="font-body-md text-on-surface-variant font-medium">
                Please ask a parent to answer this simple question to verify you're a parent.
              </p>
            </div>

            <div className="bg-surface-container py-md px-lg rounded-xl border border-outline-variant/20 font-display-lg-mobile text-secondary font-bold select-none">
              {num1} &times; {num2} = ?
            </div>

            <form onSubmit={handleVerifyGate} className="space-y-md">
              <input
                type="number"
                value={gateAnswer}
                onChange={(e) => setGateAnswer(e.target.value)}
                placeholder="Write answer..."
                className={`w-full text-center h-14 bg-surface-container-low rounded-lg border-2 font-body-lg text-lg focus:ring-0 focus:border-secondary transition-all ${
                  gateError ? "border-error ring-2 ring-error/20 animate-shake" : "border-outline-variant"
                }`}
                autoFocus
                required
              />

              {gateError && (
                <p className="text-error font-body-md font-bold animate-pulse">
                  Oops! That's not correct. Try again!
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-secondary py-md rounded-full text-white font-headline-md font-bold shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer"
              >
                Verify & Enter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
