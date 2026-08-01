"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";

const GRID_BUTTONS = [
  // Row 1
  { text: "The", icon: "music_note", freq: 261.63, bg: "bg-primary-container/80 text-on-primary-container" },
  { text: "Lord", icon: "star", freq: 293.66, bg: "bg-secondary-container/80 text-on-secondary-container" },
  { text: "is", icon: "favorite", freq: 329.63, bg: "bg-tertiary-container/80 text-on-tertiary-container" },
  { text: "my", icon: "flare", freq: 349.23, bg: "bg-error-container/80 text-on-error-container" },
  // Row 2
  { text: "Shepherd", icon: "pets", freq: 392.00, bg: "bg-secondary-container/80 text-on-secondary-container" },
  { text: "I", icon: "wb_sunny", freq: 440.00, bg: "bg-primary-container/80 text-on-primary-container" },
  { text: "shall", icon: "bolt", freq: 493.88, bg: "bg-tertiary-container/80 text-on-tertiary-container" },
  { text: "not", icon: "do_not_disturb", freq: 523.25, bg: "bg-error-container/80 text-on-error-container" },
  // Row 3
  { text: "want", icon: "celebration", freq: 659.25, bg: "bg-secondary-container/80 text-on-secondary-container" },
  { text: "♫", icon: "audiotrack", freq: 587.33, bg: "bg-primary-container/40 text-primary opacity-80" },
  { text: "♫", icon: "church", freq: 698.46, bg: "bg-tertiary-container/40 text-tertiary opacity-80" },
  { text: "Psalm", icon: "book", freq: 783.99, bg: "bg-primary-container/60 text-on-primary-container" },
  // Row 4
  { text: "23", icon: "numbers", freq: 880.00, bg: "bg-secondary-container/60 text-on-secondary-container" },
  { text: ":", icon: "check_indeterminate_small", freq: 987.77, bg: "bg-tertiary-container/60 text-on-tertiary-container" },
  { text: "1", icon: "stars", freq: 1046.50, bg: "bg-primary-container/60 text-on-primary-container" },
  { text: "Amen", icon: "check_circle", freq: [261.63, 329.63, 392.00, 523.25], bg: "bg-secondary-container/90 border-4 border-white text-on-secondary-container" }
];

export default function KidsMusicPage() {
  const { playSquish } = useApp();
  const [highlightedWord, setHighlightedWord] = useState(null);
  const [isPlayingSong, setIsPlayingSong] = useState(false);
  const [tappedNotes, setTappedNotes] = useState(new Set());

  // Verse display parts
  const verseWords = [
    { text: "The", key: "The" },
    { text: "Lord", key: "Lord" },
    { text: "is", key: "is" },
    { text: "my", key: "my" },
    { text: "Shepherd,", key: "Shepherd" },
    { text: "I", key: "I" },
    { text: "shall", key: "shall" },
    { text: "not", key: "not" },
    { text: "want.", key: "want" }
  ];

  const triggerSparkle = (e) => {
    if (!e || !e.currentTarget) return;
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
        // Soft, chime-like bell waveform
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
    setHighlightedWord(btn.text);
    
    // Play sound
    playSynthesizedNote(btn.freq);
    
    // Add to tapped notes tracker for progress bar
    if (btn.text !== "♫") {
      const newTapped = new Set(tappedNotes);
      newTapped.add(btn.text);
      setTappedNotes(newTapped);
    }

    // Clear highlight after 800ms
    setTimeout(() => {
      setHighlightedWord((curr) => (curr === btn.text ? null : curr));
    }, 800);
  };

  const playFullSong = () => {
    if (isPlayingSong) return;
    playSquish();
    setIsPlayingSong(true);
    setTappedNotes(new Set());
    
    // Chain notes in sequence
    const songSequence = [
      { word: "The", delay: 0 },
      { word: "Lord", delay: 350 },
      { word: "is", delay: 700 },
      { word: "my", delay: 1050 },
      { word: "Shepherd", delay: 1400 },
      { word: "I", delay: 1900 },
      { word: "shall", delay: 2250 },
      { word: "not", delay: 2600 },
      { word: "want", delay: 2950 },
      { word: "Amen", delay: 3600 }
    ];

    songSequence.forEach((item) => {
      setTimeout(() => {
        setHighlightedWord(item.word);
        
        // Find corresponding button config
        const btn = GRID_BUTTONS.find((b) => b.text === item.word);
        if (btn) {
          playSynthesizedNote(btn.freq);
          setTappedNotes((prev) => {
            const copy = new Set(prev);
            copy.add(item.word);
            return copy;
          });
        }
      }, item.delay);
    });

    setTimeout(() => {
      setIsPlayingSong(false);
      setHighlightedWord(null);
    }, 4500);
  };

  const handleReset = () => {
    playSquish();
    setHighlightedWord(null);
    setTappedNotes(new Set());
  };

  // Calculate verse progress (out of 9 text words)
  const matchingWordsCount = verseWords.filter((w) => tappedNotes.has(w.key)).length;
  const progressPercent = Math.min(Math.round((matchingWordsCount / verseWords.length) * 100), 100);

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-sm flex flex-col items-center gap-lg">
      
      {/* Header Section */}
      <div className="text-center flex flex-col items-center gap-sm mt-4 select-none">
        <div className="relative w-36 h-36 md:w-48 md:h-48 mb-base floating">
          <img
            className="w-full h-full object-contain filter drop-shadow-2xl"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSXzPweS2PinJaokmoaDsN1rp-79Ry0wUBx577q33xzSBMiLr0Dfju8zkeJIbmaE4YhmfBSlpFIJfodFyFv_bE0LEmRqTS9AGFO0DVpz12NVtt2_oVGg-ft3e6HGMWGi29Ie3li8uBt2BKvRSLraWuZFNLZHKizNFpytJaoRz7oDVSO7cDFaLrIL9kNTKOHeVkrbSb8TFCx3Swoy0vEDh1yHaV5-e5uR9lqqZJlRn4-1-VCY-SUlRwkQ"
            alt="Conductor Mascot"
          />
        </div>
        
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary bg-primary-container/20 px-8 py-2 rounded-full inline-block font-bold">
          Psalm 23:1 Sing-Along
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-lg font-medium leading-relaxed">
          Tap the colorful blocks to play music and learn the verse!
        </p>
      </div>

      {/* Verse Display */}
      <div className="w-full max-w-2xl bg-white rounded-xl p-md shadow-xl border-4 border-secondary-container flex flex-wrap justify-center gap-sm select-none">
        <span className="font-headline-md text-secondary font-bold text-center">
          "
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
          "
        </span>
      </div>

      {/* 4x4 Musical Sequencer Grid */}
      <div className="grid grid-cols-4 gap-sm md:gap-md w-full max-w-2xl aspect-square p-sm bg-surface-container rounded-lg shadow-inner relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-primary to-secondary pointer-events-none"></div>
        
        {/* 16 Sequencer Blocks */}
        {GRID_BUTTONS.map((btn, idx) => {
          const isButtonHighlighted = highlightedWord === btn.text;
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
              <div className="stain-glass-overlay absolute inset-0"></div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
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

      {/* Progress */}
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
