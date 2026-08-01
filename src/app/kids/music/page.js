"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { fetchStoryVerseFromYouVersion } from "@/lib/storyMemoryVerse";
import {
  buildMusicGridFromVerse,
  buildVerseWordList,
  buildSongSequence,
} from "@/lib/memoryVerses";

export default function KidsMusicPage() {
  const { playSquish, memoryStory, stories } = useApp();
  const story = memoryStory || stories[0];

  const [liveVerseText, setLiveVerseText] = useState(story?.translationKids || "");
  const [liveVerseReference, setLiveVerseReference] = useState(story?.verse || "");
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [tappedNotes, setTappedNotes] = useState(new Set());

  useEffect(() => {
    if (!story?.verse) return;
    let cancelled = false;
    fetchStoryVerseFromYouVersion(story).then((data) => {
      if (cancelled) return;
      setLiveVerseText(data.text);
      setLiveVerseReference(data.reference || story.verse);
    });
    return () => { cancelled = true; };
  }, [story?.id, story?.verse, story?.translationKids]);

  const displayText = liveVerseText || story?.translationKids || "";
  const gridButtons = useMemo(
    () => buildMusicGridFromVerse(displayText, liveVerseReference),
    [displayText, liveVerseReference]
  );
  const verseWords = useMemo(() => buildVerseWordList(displayText), [displayText]);
  const songSequence = useMemo(() => buildSongSequence(gridButtons), [gridButtons]);

  const triggerSparkle = (e) => {
    if (!e?.currentTarget) return;
    const btn = e.currentTarget;
    const sparkle = document.createElement("div");
    sparkle.className = "active-sparkle absolute pointer-events-none rounded-full w-full h-full left-0 top-0";
    btn.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  };

  const playSynthesizedNote = (freq) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const frequencies = Array.isArray(freq) ? freq : [freq];

      frequencies.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(f, now);
        osc.type = "sine";
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        osc.start();
        osc.stop(now + 0.6);
      });
    } catch (err) {
      console.warn("AudioContext suspended/blocked", err);
    }
  };

  const handleNoteClick = (btn, e) => {
    triggerSparkle(e);
    setHighlightedWord(btn.key);
    playSynthesizedNote(btn.freq);

    if (btn.text !== "♫") {
      setTappedNotes((prev) => new Set(prev).add(btn.key));
    }

    setTimeout(() => {
      setHighlightedWord((curr) => (curr === btn.key ? null : curr));
    }, 800);
  };

  const playFullSong = () => {
    if (isPlayingSong) return;
    playSquish();
    setIsPlayingSong(true);
    setTappedNotes(new Set());

    songSequence.forEach((item) => {
      setTimeout(() => {
        const btn = gridButtons.find((b) => b.text === item.word);
        if (btn) {
          setHighlightedWord(btn.key);
          playSynthesizedNote(btn.freq);
          setTappedNotes((prev) => new Set(prev).add(btn.key));
        }
      }, item.delay);
    });

    const totalDuration = (songSequence[songSequence.length - 1]?.delay || 0) + 1200;
    setTimeout(() => {
      setIsPlayingSong(false);
      setHighlightedWord(null);
    }, totalDuration);
  };

  const handleReset = () => {
    playSquish();
    setHighlightedWord(null);
    setTappedNotes(new Set());
  };

  const matchingWordsCount = verseWords.filter((w) => tappedNotes.has(w.key)).length;
  const progressPercent = verseWords.length
    ? Math.min(Math.round((matchingWordsCount / verseWords.length) * 100), 100)
    : 0;

  const storyLabel = story?.title?.replace(/^Superbook:\s*/i, "") || "Adventure";

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-sm flex flex-col items-center gap-lg">

      <div className="text-center flex flex-col items-center gap-sm mt-4 select-none">
        <div className="relative w-36 h-36 md:w-48 md:h-48 mb-base floating">
          <img
            className="w-full h-full object-contain filter drop-shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSXzPweS2PinJaokmoaDsN1rp-79Ry0wUBx577q33xzSBMiLr0Dfju8zkeJIbmaE4YhmfBSlpFIJfodFyFv_bE0LEmRqTS9AGFO0DVpz12NVtt2_oVGg-ft3e6HGMWGi29Ie3li8uBt2BKvRSLraWuZFNLZHKizNFpytJaoRz7oDVSO7cDFaLrIL9kNTKOHeVkrbSb8TFCx3Swoy0vEDh1yHaV5-e5uR9lqqZJlRn4-1-VCY-SUlRwkQ"
            alt="Conductor Mascot"
          />
        </div>

        <span className="text-xs font-black uppercase tracking-wider text-secondary px-3 py-1 rounded-full bg-secondary-container/30">
          From {storyLabel} • YouVersion ICB
        </span>
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary bg-primary-container/20 px-8 py-2 rounded-full inline-block font-bold">
          {liveVerseReference} Sing-Along
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-lg font-medium leading-relaxed">
          Same memory scripture as your adventure map — tap blocks to play and learn!
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-xl p-md shadow-xl border-4 border-secondary-container flex flex-wrap justify-center gap-sm select-none">
        <span className="font-headline-md text-secondary font-bold text-center">
          &ldquo;
          {verseWords.map((word, idx) => {
            const isWordHighlighted = highlightedWord === word.key;
            return (
              <span
                key={idx}
                className={`inline-block mx-1 transition-all duration-300 ${
                  isWordHighlighted
                    ? "text-primary font-bold animate-bounce scale-110"
                    : tappedNotes.has(word.key)
                      ? "text-primary-fixed-dim"
                      : "text-secondary"
                }`}
              >
                {word.text}
              </span>
            );
          })}
          &rdquo;
        </span>
      </div>

      <div className="grid grid-cols-4 gap-sm md:gap-md w-full max-w-2xl aspect-square p-sm bg-surface-container rounded-lg shadow-inner relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-secondary pointer-events-none" />

        {gridButtons.map((btn, idx) => {
          const isButtonHighlighted = highlightedWord === btn.key;
          return (
            <button
              key={idx}
              onClick={(e) => handleNoteClick(btn, e)}
              className={`glass-block rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden border-2 cursor-pointer transition-all duration-150 ${btn.bg} ${
                isButtonHighlighted
                  ? "border-primary ring-4 ring-primary-container/60 scale-95"
                  : "border-white/40"
              }`}
            >
              {btn.icon && (
                <span className="material-symbols-outlined mb-1 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {btn.icon}
                </span>
              )}
              <span className="font-label-caps text-xs font-bold select-none">{btn.text}</span>
              <div className="stain-glass-overlay absolute inset-0" />
            </button>
          );
        })}
      </div>

      <div className="flex gap-md w-full justify-center select-none">
        <button
          onClick={playFullSong}
          disabled={isPlayingSong}
          className="squish-btn bg-primary-container text-on-primary-container px-8 py-4 rounded-full font-headline-md flex items-center gap-sm font-bold shadow-md hover:brightness-105 transition-all cursor-pointer disabled:opacity-60"
        >
          <span className="material-symbols-outlined">play_arrow</span>
          Play Song
        </button>

        <button
          onClick={handleReset}
          className="squish-btn bg-surface-container-highest text-on-surface-variant px-8 py-4 rounded-full font-headline-md flex items-center gap-sm font-bold shadow-md hover:brightness-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined">refresh</span>
          Reset
        </button>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-sm select-none mb-xl">
        <div className="flex justify-between items-end px-sm">
          <span className="font-label-caps text-primary font-bold text-xs uppercase">Verse Memorization Progress</span>
          <span className="font-headline-md text-primary font-bold">{progressPercent}%</span>
        </div>

        <div className="h-6 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner border-2 border-white p-1">
          <div
            className="h-full bg-primary-container rounded-full shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
