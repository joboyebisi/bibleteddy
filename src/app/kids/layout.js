"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function KidsLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeChild, playSquish } = useApp();

  // Parent Gate state
  const [showGate, setShowGate] = useState(false);
  const [gateAnswer, setGateAnswer] = useState("");
  const [gateError, setGateError] = useState(false);
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(8);

  // Generate random math question on open
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
      router.push("/parent");
    } else {
      setGateError(true);
      // Reset error message after 1.5s
      setTimeout(() => setGateError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background stained-glass-bg flex flex-col">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 flex justify-between items-center px-margin-mobile py-sm md:px-margin-desktop md:py-md bg-surface/80 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(112,93,0,0.15)] h-20">
        <div className="flex items-center gap-base">
          <Link href="/kids" className="flex items-center gap-base hover:scale-102 transition-transform">
            <span className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary drop-shadow-sm font-bold">
              Bible Teddy
            </span>
          </Link>
        </div>
        
        {/* Top Navbar items (Active indicators matching pathname) */}
        <nav className="hidden md:flex gap-md">
          <Link
            href="/kids"
            className={`${
              pathname === "/kids" || pathname.startsWith("/kids/lesson") || pathname.startsWith("/kids/quiz")
                ? "text-primary border-b-4 border-primary rounded-full px-4"
                : "text-on-surface-variant hover:text-primary transition-colors"
            } py-1 font-headline-md text-headline-md font-bold transition-all`}
          >
            Stories
          </Link>
          <Link
            href="/kids/music"
            className={`${
              pathname === "/kids/music"
                ? "text-primary border-b-4 border-primary rounded-full px-4"
                : "text-on-surface-variant hover:text-primary transition-colors"
            } py-1 font-headline-md text-headline-md font-bold transition-all`}
          >
            Music
          </Link>
          <Link
            href="/kids/badges"
            className={`${
              pathname === "/kids/badges"
                ? "text-primary border-b-4 border-primary rounded-full px-4"
                : "text-on-surface-variant hover:text-primary transition-colors"
            } py-1 font-headline-md text-headline-md font-bold transition-all`}
          >
            Badges
          </Link>
        </nav>

        <div className="flex items-center gap-sm">
          <button
            onClick={openParentGate}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded-full font-label-caps text-label-caps hover:scale-105 active:scale-95 transition-all squish-effect border-b-4 border-primary/20 cursor-pointer"
          >
            Parent Gate
          </button>
          
          <Link href="/onboarding/child">
            <span className="material-symbols-outlined text-primary text-3xl cursor-pointer hover:scale-105 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_circle
            </span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 pt-20">
        {/* Persistent SideNavBar (Desktop Only) */}
        <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-80px)] fixed left-0 top-20 py-md gap-base bg-surface-container-lowest shadow-[20px_0_40px_-15px_rgba(112,93,0,0.1)] rounded-r-lg z-30">
          <div className="px-md mb-md">
            <div className="flex items-center gap-sm p-base bg-surface-container rounded-xl border border-outline-variant/30">
              <div className="w-12 h-12 rounded-full bg-primary-fixed overflow-hidden border-2 border-primary/20 shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={
                    activeChild?.avatar_url ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCDcC1eTj45Biyf3qeF1OThrhran9WZjt4WWMB3KZSxPliltJtV5qQ1CXHs40XqM9iokvLkRAAuW1zYRONG0HxIwCYM0363ZBz8xQAFL9bJBTroJj-b7TxzYW5x4NAiAbz9FLt8koRVach_g2CwHivut3MYbJoQ79voimaqIAjE9kGrGUIQlg6XuK7csFxMF_QW6SbsmRI3zIFXwqUDy3GfmpzJu04BZ8TOaCvO6q_oyA_noxg4PNupmw"
                  }
                  alt="Child Avatar"
                />
              </div>
              <div className="overflow-hidden">
                <h3 className="font-headline-md text-primary text-base truncate font-bold">
                  Hi, {activeChild?.name || "Explorer"}!
                </h3>
                <p className="font-body-md text-on-surface-variant text-xs truncate">Faith Adventure</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 flex flex-col gap-xs">
            <Link
              href="/kids"
              onClick={playSquish}
              className={`flex items-center gap-sm py-sm px-md mx-2 rounded-xl transition-all font-body-lg text-body-lg font-medium group ${
                pathname === "/kids" || pathname.startsWith("/kids/lesson") || pathname.startsWith("/kids/quiz")
                  ? "bg-primary-container text-on-primary-container shadow-inner"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/kids" ? "'FILL' 1" : "'FILL' 0" }}>auto_stories</span>
              <span>Adventures</span>
            </Link>
            
            <Link
              href="/kids/music"
              onClick={playSquish}
              className={`flex items-center gap-sm py-sm px-md mx-2 rounded-xl transition-all font-body-lg text-body-lg font-medium group ${
                pathname === "/kids/music"
                  ? "bg-primary-container text-on-primary-container shadow-inner"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/kids/music" ? "'FILL' 1" : "'FILL' 0" }}>music_note</span>
              <span>Music</span>
            </Link>
            
            <Link
              href="/kids/badges"
              onClick={playSquish}
              className={`flex items-center gap-sm py-sm px-md mx-2 rounded-xl transition-all font-body-lg text-body-lg font-medium group ${
                pathname === "/kids/badges"
                  ? "bg-primary-container text-on-primary-container shadow-inner"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/kids/badges" ? "'FILL' 1" : "'FILL' 0" }}>military_tech</span>
              <span>Badges</span>
            </Link>

            <button
              onClick={openParentGate}
              className="flex w-[calc(100%-16px)] items-center gap-sm py-sm px-md mx-2 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all font-body-lg text-body-lg text-left cursor-pointer"
            >
              <span className="material-symbols-outlined">lock</span>
              <span>Parent Hub</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 md:ml-64 min-h-[calc(100vh-80px)] pb-28 md:pb-8 flex flex-col">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible only on Mobile) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl flex justify-around py-sm z-30 border-t border-surface-container-high">
        <Link href="/kids" onClick={playSquish} className={`flex flex-col items-center gap-xs ${pathname === "/kids" || pathname.startsWith("/kids/lesson") || pathname.startsWith("/kids/quiz") ? "text-primary" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: (pathname === "/kids" || pathname.startsWith("/kids/lesson")) ? "'FILL' 1" : "'FILL' 0" }}>auto_stories</span>
          <span className="font-label-caps text-[10px]">Stories</span>
        </Link>
        <Link href="/kids/music" onClick={playSquish} className={`flex flex-col items-center gap-xs ${pathname === "/kids/music" ? "text-primary" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/kids/music" ? "'FILL' 1" : "'FILL' 0" }}>music_note</span>
          <span className="font-label-caps text-[10px]">Music</span>
        </Link>
        <Link href="/kids/badges" onClick={playSquish} className={`flex flex-col items-center gap-xs ${pathname === "/kids/badges" ? "text-primary" : "text-on-surface-variant"}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === "/kids/badges" ? "'FILL' 1" : "'FILL' 0" }}>military_tech</span>
          <span className="font-label-caps text-[10px]">Badges</span>
        </Link>
        <button onClick={openParentGate} className="flex flex-col items-center gap-xs text-on-surface-variant cursor-pointer">
          <span className="material-symbols-outlined">lock</span>
          <span className="font-label-caps text-[10px]">Parent</span>
        </button>
      </nav>

      {/* COPPA Parent Gate Modal */}
      {showGate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-sm animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-xl p-md md:p-lg max-w-sm w-full soft-neomorph border border-outline-variant/30 flex flex-col gap-md text-center transform scale-100 transition-all duration-300">
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
              <p className="font-body-md text-on-surface-variant">
                Please ask a parent to answer this simple question to enter the Parent Dashboard.
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
                placeholder="Write your answer..."
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
