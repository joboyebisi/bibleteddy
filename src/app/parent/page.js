"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function ParentDashboardPage() {
  const router = useRouter();
  const {
    parent,
    kidsProfiles,
    activeChild,
    selectChild,
    curatedVideos,
    addCuratedVideo,
    playSquish,
    playSuccess,
    signOut
  } = useApp();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCurateSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setErrorMsg("Please paste a valid YouTube URL first!");
      return;
    }
    if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
      setErrorMsg("Please enter a valid YouTube link (youtube.com or youtu.be)");
      return;
    }

    playSquish();
    setErrorMsg("");
    setSuccessMsg("");
    setIsGenerating(true);
    setGenProgress(0);

    const interval = setInterval(() => {
      setGenProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          completeQuizGeneration();
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  const completeQuizGeneration = async () => {
    try {
      const video = await addCuratedVideo(youtubeUrl);
      setSuccessMsg(`Successfully scanned video and generated quiz: "${video.title}"`);
      setYoutubeUrl("");
      playSuccess();
    } catch (err) {
      setErrorMsg("Error parsing video transcripts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProfileSelect = (id) => {
    playSquish();
    selectChild(id);
  };

  return (
    <div className="bg-background font-body-md text-on-background min-h-screen">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile py-sm md:px-margin-desktop md:py-md bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(112,93,0,0.15)] h-20">
        <Link href="/" className="flex items-center gap-sm">
          <span className="font-display-lg text-display-lg-mobile text-primary drop-shadow-sm font-bold">
            Bible Teddy
          </span>
        </Link>
        <nav className="hidden md:flex gap-md items-center">
          <Link
            href="/"
            className="text-on-surface-variant/80 hover:text-primary transition-colors font-headline-md text-headline-md px-4 py-1 font-bold"
          >
            Home
          </Link>
          <Link
            href="/kids"
            className="text-on-surface-variant/80 hover:text-primary transition-colors font-headline-md text-headline-md px-4 py-1 font-bold"
          >
            Kids App
          </Link>
          <Link
            href="/parent"
            className="text-primary border-b-4 border-primary rounded-full px-4 py-1 font-headline-md text-headline-md font-bold"
          >
            Parent Hub
          </Link>
        </nav>
        <div className="flex items-center gap-sm">
          <button
            onClick={() => {
              playSquish();
              signOut();
            }}
            className="text-tertiary hover:text-error transition-colors font-label-caps text-xs font-bold px-3 py-2 rounded-lg hover:bg-error/5 cursor-pointer"
          >
            Sign Out
          </button>
          <span className="material-symbols-outlined text-primary text-[32px] p-2 rounded-full shadow-sm bg-white/50">
            account_circle
          </span>
        </div>
      </header>

      {/* Side Navigation Shell (Desktop Only) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 pt-32 pb-md px-md gap-base bg-surface-container-lowest border-r-0 shadow-[20px_0_40px_-15px_rgba(112,93,0,0.1)] z-40">
        <div className="flex flex-col items-center mb-lg">
          <div className="w-20 h-20 rounded-full bg-primary-container p-1 shadow-md mb-xs overflow-hidden">
            <img
              className="w-full h-full object-cover rounded-full"
              src={
                activeChild?.avatar_url ||
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCDcC1eTj45Biyf3qeF1OThrhran9WZjt4WWMB3KZSxPliltJtV5qQ1CXHs40XqM9iokvLkRAAuW1zYRONG0HxIwCYM0363ZBz8xQAFL9bJBTroJj-b7TxzYW5x4NAiAbz9FLt8koRVach_g2CwHivut3MYbJoQ79voimaqIAjE9kGrGUIQlg6XuK7csFxMF_QW6SbsmRI3zIFXwqUDy3GfmpzJu04BZ8TOaCvO6q_oyA_noxg4PNupmw"
              }
              alt="Mascot Avatar"
            />
          </div>
          <p className="font-headline-md text-headline-md text-primary font-bold">
            {activeChild?.name || "Parent Hub"}
          </p>
          <p className="font-body-md text-on-surface-variant/70 text-xs font-bold uppercase tracking-wide">
            {parent?.email || "parent@youversion.com"}
          </p>
        </div>
        
        <div className="space-y-sm">
          <Link
            href="/kids"
            onClick={playSquish}
            className="w-full flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all font-body-lg text-body-lg font-bold"
          >
            <span className="material-symbols-outlined">auto_stories</span>
            <span>Kids App</span>
          </Link>
          
          <Link
            href="/kids/music"
            onClick={playSquish}
            className="w-full flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all font-body-lg text-body-lg font-bold"
          >
            <span className="material-symbols-outlined">music_note</span>
            <span>Music Hub</span>
          </Link>
          
          <Link
            href="/kids/badges"
            onClick={playSquish}
            className="w-full flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all font-body-lg text-body-lg font-bold"
          >
            <span className="material-symbols-outlined">military_tech</span>
            <span>Badges</span>
          </Link>
          
          <Link
            href="/parent"
            className="w-full flex items-center gap-sm px-md py-sm bg-primary-container text-on-primary-container rounded-xl shadow-inner font-body-lg text-body-lg font-bold"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              lock
            </span>
            <span>Parent Dashboard</span>
          </Link>
        </div>
      </aside>

      {/* Main Canvas */}
      <main className="md:pl-64 pt-32 pb-xl px-margin-mobile md:px-margin-desktop bg-surface-bright min-h-screen">
        <div className="max-w-5xl mx-auto space-y-xl">
          {/* Header Greeting */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-xs font-bold leading-tight">
                Parent Dashboard
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                Oversee and enrich your child's spiritual growth journey.
              </p>
            </div>
            
            <div className="flex items-center gap-sm bg-secondary-container/20 px-md py-sm rounded-lg border border-secondary-container/30">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified_user
              </span>
              <p className="font-label-caps text-label-caps text-on-secondary-container font-bold text-xs">
                Safe Mode: Active
              </p>
            </div>
          </section>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Progress Overview (Bento Large) */}
            <section className="md:col-span-8 bg-surface-container-lowest rounded-lg p-lg soft-shadow flex flex-col gap-lg border border-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-on-primary-container text-md">trending_up</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Progress Overview</h2>
                </div>
                <select className="bg-surface-container-low border-none rounded-full px-4 py-2 font-label-caps text-label-caps text-on-surface-variant focus:ring-primary font-bold text-xs">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">
                {/* Chart Mockup: Quiz Averages */}
                <div className="space-y-md">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-bold text-xs">
                    Quiz Averages
                  </p>
                  <div className="h-40 flex items-end justify-between gap-2 px-sm border-b border-surface-container-high pb-1">
                    <div className="w-full bg-secondary-container/70 rounded-t-lg h-[60%] hover:bg-secondary-container transition-all" title="Mon: 60%"></div>
                    <div className="w-full bg-secondary-container/70 rounded-t-lg h-[40%] hover:bg-secondary-container transition-all" title="Tue: 40%"></div>
                    <div className="w-full bg-secondary-container/70 rounded-t-lg h-[85%] hover:bg-secondary-container transition-all" title="Wed: 85%"></div>
                    <div className="w-full bg-secondary-container/70 rounded-t-lg h-[70%] hover:bg-secondary-container transition-all" title="Thu: 70%"></div>
                    <div className="w-full bg-secondary-container/70 rounded-t-lg h-[95%] hover:bg-secondary-container transition-all" title="Fri: 95%"></div>
                  </div>
                  <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant/60 px-sm font-bold text-[10px]">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                  </div>
                </div>
                
                {/* Virtues Earned Counter */}
                <div className="space-y-md">
                  <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest font-bold text-xs">
                    Virtues Earned ({activeChild?.name || "Child"})
                  </p>
                  
                  <div className="grid grid-cols-3 gap-sm">
                    <div className="aspect-square bg-tertiary-container rounded-lg flex flex-col items-center justify-center gap-xs text-on-tertiary-container shadow-inner border border-white">
                      <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        favorite
                      </span>
                      <span className="font-label-caps text-[10px] font-bold">Love ({activeChild?.virtues?.love || 80}%)</span>
                    </div>
                    
                    <div className="aspect-square bg-primary-container rounded-lg flex flex-col items-center justify-center gap-xs text-on-primary-container shadow-inner border border-white">
                      <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        light_mode
                      </span>
                      <span className="font-label-caps text-[10px] font-bold">Joy ({activeChild?.virtues?.faith || 60}%)</span>
                    </div>
                    
                    <div className="aspect-square bg-secondary-container rounded-lg flex flex-col items-center justify-center gap-xs text-on-secondary-container shadow-inner border border-white">
                      <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                        psychology
                      </span>
                      <span className="font-label-caps text-[10px] font-bold">Wisdom ({activeChild?.virtues?.kindness || 75}%)</span>
                    </div>
                    
                    <div className="aspect-square bg-surface-container-high rounded-lg flex items-center justify-center opacity-40 border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-on-surface-variant text-md">lock</span>
                    </div>
                    <div className="aspect-square bg-surface-container-high rounded-lg flex items-center justify-center opacity-40 border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-on-surface-variant text-md">lock</span>
                    </div>
                    <div className="aspect-square bg-surface-container-high rounded-lg flex items-center justify-center opacity-40 border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-on-surface-variant text-md">lock</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Profile Switcher (Bento Side) */}
            <section className="md:col-span-4 bg-surface-container-lowest rounded-lg p-lg soft-shadow flex flex-col gap-md border border-white">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Profiles</h2>
              
              <div className="space-y-sm">
                {kidsProfiles.length === 0 ? (
                  <p className="font-body-md text-on-surface-variant text-sm font-medium">No child profiles found. Create one below!</p>
                ) : (
                  kidsProfiles.map((k) => (
                    <div
                      key={k.id}
                      onClick={() => handleProfileSelect(k.id)}
                      className={`flex items-center gap-md p-sm rounded-xl cursor-pointer transition-all border-2 ${
                        k.id === activeChild?.id
                          ? "bg-secondary-container/20 border-secondary"
                          : "bg-surface-container-low border-transparent hover:bg-surface-container-high"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                        <img className="w-full h-full object-cover" src={k.avatar_url} alt={k.name} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={`font-headline-md text-headline-md font-bold truncate ${k.id === activeChild?.id ? "text-secondary" : "text-on-surface"}`}>
                          {k.name}
                        </p>
                        <p className="font-body-md text-on-surface-variant/70 text-xs font-medium truncate">
                          Age {k.age_group} • {k.seeds} Seeds
                        </p>
                      </div>
                      {k.id === activeChild?.id && (
                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </div>
                  ))
                )}
                
                {/* Add Child Button */}
                <button
                  onClick={() => {
                    playSquish();
                    router.push("/onboarding/child");
                  }}
                  className="w-full py-sm border-2 border-dashed border-outline-variant hover:border-secondary hover:text-secondary rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-all flex items-center justify-center gap-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span className="font-label-caps text-xs font-bold">Add Child</span>
                </button>
              </div>
            </section>

            {/* Content Curation Module (Wide Section) */}
            <section className="md:col-span-12 bg-white rounded-lg p-lg soft-shadow border border-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-md mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-on-secondary-container text-md">video_library</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Content Curation</h2>
                </div>
                <p className="font-body-md text-on-surface-variant max-w-md font-medium">
                  Add YouTube videos from your favorite ministries and our AI will generate safe quizzes for your kids automatically.
                </p>
              </div>
              
              <form onSubmit={handleCurateSubmit} className="flex flex-col sm:flex-row gap-md items-center w-full">
                <div className="relative flex-1 w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/40">
                    link
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-2 border-outline-variant focus:border-secondary focus:ring-0 rounded-xl font-body-md transition-all font-medium"
                    placeholder="Paste YouTube URL here (e.g. https://youtube.com/watch?v=...)"
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={isGenerating}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-xl py-4 bg-secondary text-white rounded-full font-headline-md text-headline-md flex items-center justify-center gap-sm squish-effect shadow-lg shadow-secondary/20 whitespace-nowrap font-bold cursor-pointer hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Quiz
                </button>
              </form>

              {/* Progress feedback */}
              {isGenerating && (
                <div className="mt-md p-md bg-secondary-container/20 rounded-xl border border-secondary/20 flex flex-col gap-sm animate-pulse">
                  <div className="flex items-center gap-sm">
                    <span className="material-symbols-outlined text-secondary animate-spin">sync</span>
                    <span className="font-headline-md text-secondary text-sm font-bold">
                      Gloo AI &amp; Video2App Engine checking transcripts... {genProgress}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${genProgress}%` }}></div>
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="mt-md p-sm bg-primary-container/20 text-primary border border-primary/25 rounded-xl text-center font-body-md font-bold">
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="mt-md p-sm bg-error-container/20 text-error border border-error/25 rounded-xl text-center font-body-md font-bold">
                  {errorMsg}
                </div>
              )}

              {/* List of Curated Videos */}
              <div className="mt-lg pt-lg border-t border-surface-container-high">
                <h3 className="font-headline-md text-primary mb-md font-bold">Your Curated Library ({curatedVideos.length} stories)</h3>
                {curatedVideos.length === 0 ? (
                  <p className="text-on-surface-variant font-body-md text-sm font-medium">No parent-curated stories added yet. Paste a link above!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                    {curatedVideos.map((v) => (
                      <div key={v.id} className="flex justify-between items-center bg-surface-container-low p-md rounded-xl border border-outline-variant/20 shadow-sm">
                        <div className="flex items-center gap-sm overflow-hidden">
                          <span className="material-symbols-outlined text-secondary">movie</span>
                          <div className="overflow-hidden">
                            <p className="font-headline-md text-sm font-bold truncate text-on-surface">{v.title}</p>
                            <p className="font-body-md text-xs font-medium text-on-surface-variant truncate">{v.youtube_url}</p>
                          </div>
                        </div>
                        <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-2 py-1 rounded-full uppercase shrink-0 border border-primary/20">
                          Quiz Ready
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
          
          {/* Quick Enter Kid Mode Area */}
          <div className="flex justify-center mt-lg w-full">
            <button
              onClick={() => {
                playSquish();
                router.push("/kids");
              }}
              className="bg-primary text-on-primary font-headline-md font-bold px-12 py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-102 transition-all cursor-pointer flex items-center gap-sm"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                child_care
              </span>
              Enter Kid's Interface
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
