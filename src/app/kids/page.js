"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

// YouVersion-style weekly memory verses
const MEMORY_VERSES = [
  {
    id: "gen11",
    reference: "Genesis 1:1",
    translation: "ICB",
    text: "In the beginning, God created the sky and the earth.",
    hint: "Think about how everything started with God's voice!"
  },
  {
    id: "ps231",
    reference: "Psalm 23:1",
    translation: "ICB",
    text: "The Lord is my shepherd. I have everything I need.",
    hint: "Think of a loving shepherd protecting his little sheep."
  },
  {
    id: "john316",
    reference: "John 3:16",
    translation: "ESV",
    text: "For God so loved the world, that he gave his only Son.",
    hint: "God's greatest gift of love sent down to earth."
  },
  {
    id: "phil413",
    reference: "Philippians 4:13",
    translation: "ICB",
    text: "I can do all things through Christ because he gives me strength.",
    hint: "Where does your strength and courage come from?"
  }
];

const TRIVIA_QUESTIONS = [
  {
    prompt: "Who stepped up with a sling and five smooth stones to face giant Goliath?",
    options: ["Shepherd Boy David", "King Saul", "Samson", "Moses"],
    correct: "Shepherd Boy David",
    verseRef: "1 Samuel 17:40",
    explanation: "David trusted God's power and defeated Goliath with faith!"
  },
  {
    prompt: "What sign did God place in the sky after the Great Flood?",
    options: ["A glowing Rainbow 🌈", "A silver star ✨", "A thunderbolt ⚡", "A golden crown 👑"],
    correct: "A glowing Rainbow 🌈",
    verseRef: "Genesis 9:13",
    explanation: "God placed His rainbow as an everlasting covenant promise!"
  },
  {
    prompt: "Where was baby Jesus born according to the First Christmas story?",
    options: ["A stable in Bethlehem 🌟", "A palace in Rome 🏛️", "A sailboat at sea ⛵", "Under a palm tree 🌴"],
    correct: "A stable in Bethlehem 🌟",
    verseRef: "Luke 2:7",
    explanation: "Jesus was humbly born in a manger in Bethlehem!"
  }
];

export default function KidsAdventurePage() {
  const router = useRouter();
  const { stories, curatedVideos, activeChild, verseOfDay, playSquish, playSuccess, addSeeds, logVerseCompletion } = useApp();

  // Adventure Map Active Pin
  const [selectedNode, setSelectedNode] = useState(stories[0]);

  // Voice & Trivia Arena Tab
  const [activeQuizMode, setActiveQuizMode] = useState("voice");
  const [selectedVerse, setSelectedVerse] = useState(MEMORY_VERSES[0]);
  const [liveVerseText, setLiveVerseText] = useState("");
  const [liveVerseSource, setLiveVerseSource] = useState("");

  // Voice state
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [verifyingVoice, setVerifyingVoice] = useState(false);
  const [voiceResult, setVoiceResult] = useState(null);

  // Trivia state
  const [currentTriviaIdx, setCurrentTriviaIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [triviaSubmitted, setTriviaSubmitted] = useState(false);

  const currentQ = TRIVIA_QUESTIONS[currentTriviaIdx];

  // Fetch live verse from YouVersion API when verse selection changes
  useEffect(() => {
    const fetchVerse = async () => {
      try {
        const res = await fetch(`/api/youversion/verse?reference=${encodeURIComponent(selectedVerse.reference)}&translation=${selectedVerse.translation}`);
        if (res.ok) {
          const data = await res.json();
          if (data.text) {
            setLiveVerseText(data.text);
            setLiveVerseSource(data.source || "");
          }
        }
      } catch { /* use static fallback */ }
    };
    fetchVerse();
  }, [selectedVerse]);

  const handleWatchQuiz = (story) => {
    playSuccess();
    router.push(`/kids/lesson?id=${story.id}`);
  };

  const handleStartVoiceCheck = () => {
    playSquish();
    setVoiceResult(null);
    setSpokenTranscript("");
    const verseText = liveVerseText || selectedVerse.text;

    const processResult = async (transcript) => {
      setIsListeningMic(false);
      setVerifyingVoice(true);
      setSpokenTranscript(transcript);
      try {
        // Use Gloo AI voice-match API
        const res = await fetch("/api/gloo/voice-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spokenText: transcript, targetVerse: verseText, verseReference: selectedVerse.reference })
        });
        const result = await res.json();
        setVerifyingVoice(false);
        setVoiceResult({
          accuracyPercent: result.accuracyPercent,
          passed: result.passed,
          bonusSparkles: result.passed ? 50 : 0,
          teddyFeedback: result.teddyFeedback || (result.passed ? "Amazing!" : "Keep trying!"),
          aiSource: result.source,
          aiModel: result.model,
        });
        if (result.passed) { playSuccess(); addSeeds(20); logVerseCompletion?.(selectedVerse.reference, selectedVerse.translation, result.accuracyPercent, true, 20); }
        else playSquish();
      } catch {
        setVerifyingVoice(false);
        // Local fallback scoring
        const spoken = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, "");
        const target = verseText.toLowerCase().replace(/[^a-z0-9 ]/g, "");
        const spokenWords = spoken.split(" ");
        const targetWords = target.split(" ");
        const matched = spokenWords.filter(w => targetWords.includes(w)).length;
        const accuracy = Math.round((matched / Math.max(targetWords.length, 1)) * 100);
        const passed = accuracy >= 65;
        setVoiceResult({ accuracyPercent: accuracy, passed, bonusSparkles: passed ? 50 : 0, teddyFeedback: passed ? "Splendid! 🌟" : "Keep practising! 🧸" });
        if (passed) { playSuccess(); addSeeds(20); }
        else playSquish();
      }
    };

    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRecognition) {
      setIsListeningMic(true);
      setTimeout(() => processResult(verseText), 2000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    setIsListeningMic(true);
    recognition.start();
    recognition.onresult = (e) => processResult(e.results[0][0].transcript);
    recognition.onerror = () => { setIsListeningMic(false); setVerifyingVoice(false); };
    recognition.onend = () => { setIsListeningMic(false); };
  };

  const handleTriviaSubmit = (opt) => {
    setSelectedAnswer(opt);
    setTriviaSubmitted(true);
    if (opt === currentQ.correct) { playSuccess(); addSeeds(15); }
    else playSquish();
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-8 max-w-7xl mx-auto">

      {/* ── 1. DAILY QUEST HERO BANNER ── */}
      <section
        className="relative rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-4 overflow-hidden select-none"
        style={{
          background: "linear-gradient(135deg, #ffd700 0%, #ffe566 50%, #ffd700 100%)",
          borderColor: "#e9c400",
          boxShadow: "0 20px 60px -10px rgba(112,93,0,0.25)"
        }}
      >
        {/* Decorative sparkle dots */}
        <div className="absolute top-4 right-20 w-3 h-3 rounded-full bg-white/40 animate-ping" />
        <div className="absolute bottom-6 left-24 w-2 h-2 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute top-1/2 right-8 w-4 h-4 rounded-full bg-white/20 animate-bounce" />

        <div className="relative z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 text-xs font-black border"
            style={{ background: "rgba(112,93,0,0.12)", borderColor: "rgba(112,93,0,0.2)", color: "#705d00" }}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Interactive Faith Kingdom
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ color: "#3d3300" }}>
            Bible Adventure Map
          </h1>
          <p className="text-sm font-semibold max-w-xl leading-relaxed mb-4" style={{ color: "#705d00" }}>
            Welcome back, <span className="font-black">{activeChild?.name || "Explorer"}</span>! Travel through timeless Scripture stories, collect Golden Stars, and unlock heavenly Faith Badges!
          </p>
          {verseOfDay?.text && (
            <div className="mt-3 p-3 rounded-xl border text-sm font-medium max-w-xl"
              style={{ background: "rgba(255,255,255,0.85)", borderColor: "rgba(255,102,0,0.3)", color: "#544600" }}>
              <span className="font-black text-[#ff6600]">
                YouVersion Verse of the Day — {verseOfDay.reference}
                {verseOfDay.translation ? ` (${verseOfDay.translation})` : ""}
              </span>
              <p className="mt-1 italic">&ldquo;{verseOfDay.text}&rdquo;</p>
              {verseOfDay.source === "youversion" && (
                <p className="text-[10px] font-bold mt-1 text-[#0c6780]">Live from YouVersion Platform API</p>
              )}
            </div>
          )}
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1"
              style={{ background: "#705d00", color: "#ffd700" }}>
              <span className="material-symbols-outlined text-sm">celebration</span>
              Daily Quest Active
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{ background: "rgba(255,255,255,0.7)", color: "#705d00", borderColor: "rgba(112,93,0,0.2)" }}>
              {stories.length} Curated Lessons
            </span>
          </div>
        </div>

        <div className="relative z-10 w-32 h-32 md:w-40 md:h-40 shrink-0">
          <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse blur-2xl" />
          <img
            alt="Bible Teddy Mascot"
            className="w-full h-full object-contain filter drop-shadow-xl floating"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
          />
        </div>
      </section>

      {/* ── 2. CONNECTED ADVENTURE MAP ── */}
      <section className="rounded-3xl border-2 overflow-hidden"
        style={{ background: "#fbf9f5", borderColor: "#d0c6ab", boxShadow: "0 20px 40px -15px rgba(112,93,0,0.12)" }}>

        {/* Map Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid #e4e2de" }}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1"
              style={{ background: "#ffe16d", color: "#544600", border: "1px solid #e9c400" }}>
              <span className="material-symbols-outlined text-sm">map</span>
              Superbook Episode Journey
            </div>
            <h2 className="text-xl font-black" style={{ color: "#1b1c1a" }}>Curated Video Quest Map</h2>
            <p className="text-xs font-medium mt-0.5" style={{ color: "#4d4732" }}>
              Tap a story node to reveal its details, then watch &amp; take the interactive quiz!
            </p>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl border"
            style={{ background: "#ffe16d", borderColor: "#e9c400" }}>
            <span className="text-2xl">🧸</span>
            <div>
              <span className="text-[10px] font-black block" style={{ color: "#544600" }}>Teddy Guide</span>
              <span className="text-xs font-bold" style={{ color: "#705d00" }}>Always Watching!</span>
            </div>
          </div>
        </div>

        {/* Map Canvas + Side Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">

          {/* LEFT: Interactive Map Canvas (8 cols) */}
          <div className="lg:col-span-8 p-6">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden border-2"
              style={{
                background: "radial-gradient(ellipse at 30% 30%, rgba(255,215,0,0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(154,225,255,0.08) 0%, transparent 60%), #fbf9f5",
                borderColor: "#d0c6ab"
              }}>

              {/* Dot grid texture */}
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "radial-gradient(circle, rgba(112,93,0,0.12) 1.5px, transparent 1.5px)",
                backgroundSize: "20px 20px"
              }} />

              {/* Golden connecting path SVG */}
              <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path
                  d="M 18 75 Q 25 60 32 45 T 50 68 T 68 35 T 82 60"
                  fill="none"
                  stroke="url(#mapGold)"
                  strokeWidth="1.2"
                  strokeDasharray="3 2"
                  style={{ animation: "pulse 3s ease-in-out infinite" }}
                />
                <defs>
                  <linearGradient id="mapGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ffd700" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Story Node Pins */}
              {stories.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const isLocked = node.locked;

                return (
                  <div
                    key={node.id}
                    style={{ left: `${node.xPercent}%`, top: `${node.yPercent}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  >
                    <button
                      onClick={() => {
                        playSquish();
                        if (!isLocked) setSelectedNode(node);
                        else alert(`Earn ${node.requiredBadges} badges to unlock ${node.title}!`);
                      }}
                      className={`relative flex flex-col items-center transition-all duration-300 ${isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-110"}`}
                    >
                      {/* Glow ring on selected */}
                      {isSelected && (
                        <span className="absolute -inset-3 rounded-full pointer-events-none animate-ping"
                          style={{ background: "rgba(255,215,0,0.3)" }} />
                      )}

                      {/* Node icon circle */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-all border-2"
                        style={isSelected
                          ? { background: "linear-gradient(135deg,#ffd700,#ffe566)", borderColor: "#e9c400", color: "#3d3300", transform: "scale(1.08)", boxShadow: "0 8px 24px rgba(255,215,0,0.5), 0 0 0 4px rgba(255,215,0,0.2)" }
                          : isLocked
                          ? { background: "#e4e2de", borderColor: "#d0c6ab", color: "#9e9e9e" }
                          : { background: "white", borderColor: "#d0c6ab", color: "#705d00", boxShadow: "0 4px 12px rgba(112,93,0,0.15)" }
                        }
                      >
                        <span className="material-symbols-outlined text-2xl font-bold">
                          {isLocked ? "lock" : node.mapIcon}
                        </span>
                      </div>

                      {/* Stars */}
                      {!isLocked && (
                        <div className="mt-1 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] border shadow-sm"
                          style={{ background: "white", borderColor: "#d0c6ab" }}>
                          {[1, 2, 3].map((s) => (
                            <span key={s} className="material-symbols-outlined text-[10px]"
                              style={{ fontVariationSettings: s <= (node.stars || 0) ? "'FILL' 1" : "'FILL' 0", color: s <= (node.stars || 0) ? "#705d00" : "#d0c6ab" }}>
                              star
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title label */}
                      <div className="mt-1 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-md text-center max-w-[90px] sm:max-w-[110px] truncate border"
                        style={isSelected
                          ? { background: "#705d00", color: "#ffd700", borderColor: "#705d00" }
                          : { background: "white", color: "#3d3300", borderColor: "#d0c6ab", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }
                        }
                      >
                        {node.title.replace("Superbook: ", "")}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Node Details Drawer (4 cols) */}
          <div className="lg:col-span-4 border-l flex flex-col" style={{ borderColor: "#e4e2de" }}>
            <div className="p-6 flex flex-col justify-between h-full gap-4">

              {/* Era tag & stars */}
              <div className="flex justify-between items-center select-none">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border"
                  style={{ background: "#ffe16d", color: "#544600", borderColor: "#e9c400" }}>
                  {selectedNode?.era || "Gospels"}
                </span>
                <div className="flex items-center gap-1 text-xs font-black" style={{ color: "#705d00" }}>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1", color: "#e9c400" }}>star</span>
                  {selectedNode?.stars || 0} / 3
                </div>
              </div>

              {/* Title & icon */}
              <div className="flex items-center gap-3 select-none">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                  style={{ background: "linear-gradient(135deg,#ffd700,#ffe566)" }}>
                  <span className="material-symbols-outlined text-3xl font-bold" style={{ color: "#3d3300" }}>
                    {selectedNode?.mapIcon || "child_care"}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight" style={{ color: "#1b1c1a" }}>
                    {selectedNode?.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#4d4732" }}>
                    Interactive Video Quest
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs font-medium leading-relaxed px-3.5 py-3 rounded-xl border"
                style={{ background: "#f5f3ef", borderColor: "#e4e2de", color: "#4d4732" }}>
                {selectedNode?.desc}
              </p>

              {/* Scripture Box */}
              <div className="rounded-2xl p-4 border relative" style={{ background: "#fffde7", borderColor: "#e9c400" }}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: "#705d00" }}>
                    <span className="material-symbols-outlined text-xs">menu_book</span>
                    Memory Scripture
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: "#705d00" }}>ICB &amp; ESV</span>
                </div>
                <p className="text-xs font-black mb-1" style={{ color: "#3d3300" }}>
                  {selectedNode?.verse}
                </p>
                <p className="text-xs italic font-medium leading-snug" style={{ color: "#544600" }}>
                  "{selectedNode?.translationKids}"
                </p>
              </div>

              {/* PRIMARY CTA – Watch & Interactive Quiz */}
              <button
                id="launch-video-btn"
                onClick={() => handleWatchQuiz(selectedNode)}
                className="w-full flex justify-between items-center px-4 py-4 rounded-2xl font-black text-sm transition-all active:scale-[0.98] cursor-pointer squishy-button select-none"
                style={{ background: "linear-gradient(135deg,#ffd700,#f5c800)", color: "#3d3300", border: "1px solid #e9c400" }}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  <span>Watch &amp; Interactive Quiz</span>
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded-lg" style={{ background: "rgba(61,51,0,0.12)" }}>
                  +50 Seeds
                </span>
              </button>

            </div>
          </div>
        </div>
      </section>

      {/* ── 3. MASTER MEMORY VERSES TAB (Voice Reciter & Trivia) ── */}
      <section className="rounded-3xl border-2 overflow-hidden"
        style={{ background: "white", borderColor: "#d0c6ab", boxShadow: "0 20px 40px -15px rgba(112,93,0,0.10)" }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6 pt-6 pb-4 border-b select-none"
          style={{ borderColor: "#e4e2de" }}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-1 border"
              style={{ background: "#ffe16d", color: "#544600", borderColor: "#e9c400" }}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              YouVersion Weekly Verse
            </div>
            <h2 className="text-xl font-black" style={{ color: "#1b1c1a" }}>Master Memory Verses</h2>
            <p className="text-xs font-medium" style={{ color: "#4d4732" }}>
              Recite this week's verse aloud with your mic, or test your Bible trivia knowledge!
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-2xl border p-1 gap-1" style={{ background: "#f5f3ef", borderColor: "#e4e2de" }}>
            {[["voice", "mic", "🎤 Voice Reciter"], ["trivia", "quiz", "🎯 Scripture Trivia"]].map(([mode, icon, label]) => (
              <button
                key={mode}
                onClick={() => {
                  playSquish();
                  setActiveQuizMode(mode);
                  if (mode === "voice") { setVoiceResult(null); setSpokenTranscript(""); }
                  else { setSelectedAnswer(null); setTriviaSubmitted(false); }
                }}
                className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1"
                style={activeQuizMode === mode
                  ? { background: "#ffd700", color: "#3d3300", boxShadow: "0 2px 8px rgba(255,215,0,0.4)" }
                  : { color: "#4d4732" }
                }
              >
                <span className="material-symbols-outlined text-sm">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* ─ VOICE VERSE RECITER ─ */}
          {activeQuizMode === "voice" && (
            <div className="space-y-5">

              {/* Verse selector pills */}
              <div className="flex flex-wrap items-center gap-2 select-none">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#705d00" }}>Choose Verse:</span>
                {MEMORY_VERSES.map((v) => (
                  <button key={v.id}
                    onClick={() => { playSquish(); setSelectedVerse(v); setSpokenTranscript(""); setVoiceResult(null); }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer"
                    style={v.id === selectedVerse.id
                      ? { background: "#ffd700", color: "#3d3300", borderColor: "#e9c400", fontWeight: 900 }
                      : { background: "#f5f3ef", color: "#4d4732", borderColor: "#e4e2de" }
                    }
                  >
                    {v.reference} ({v.translation})
                  </button>
                ))}
              </div>

              {/* Target verse display */}
              <div className="rounded-2xl p-6 text-center space-y-2 border-2 relative"
                style={{ background: "#fffde7", borderColor: "#e9c400" }}>
                <div className="absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-full border"
                   style={{
                     background: liveVerseSource === "youversion" ? "#0c6780" : "#ffe16d",
                     color: liveVerseSource === "youversion" ? "white" : "#544600",
                     borderColor: liveVerseSource === "youversion" ? "#0c6780" : "#e9c400",
                   }}>
                   {liveVerseSource === "youversion"
                     ? `✓ YouVersion API (${selectedVerse.translation})`
                     : "YouVersion API"}
                </div>
                <h3 className="text-xl font-black" style={{ color: "#3d3300" }}>{selectedVerse.reference}</h3>
                <p className="text-lg italic font-bold leading-relaxed max-w-xl mx-auto" style={{ color: "#544600" }}>
                  "{liveVerseText || selectedVerse.text}"
                </p>
                <p className="text-xs font-bold" style={{ color: "#705d00" }}>
                  💡 Clue: {selectedVerse.hint}
                </p>
              </div>

              {/* Mic button stage */}
              <div className="flex flex-col items-center space-y-4 py-4 select-none">
                <button
                  disabled={isListeningMic || verifyingVoice}
                  onClick={handleStartVoiceCheck}
                  className="w-28 h-28 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all border-4 border-white cursor-pointer"
                  style={isListeningMic
                    ? { background: "#ba1a1a", color: "white", animation: "bounce 0.8s infinite" }
                    : { background: "linear-gradient(135deg,#ffd700,#f5c800)", color: "#3d3300", boxShadow: "0 8px 32px rgba(255,215,0,0.5)" }
                  }
                >
                  <span className="material-symbols-outlined text-4xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                  <span className="text-[10px] font-black uppercase">
                    {isListeningMic ? "Listening..." : "Tap & Recite"}
                  </span>
                </button>

                <p className="text-xs font-medium text-center max-w-sm" style={{ color: "#4d4732" }}>
                  {isListeningMic
                    ? "🎤 Speak clearly into your microphone now..."
                    : "Tap the glowing mic and recite the scripture out loud!"}
                </p>

                {verifyingVoice && (
                  <div className="flex items-center gap-2 text-xs font-black animate-pulse" style={{ color: "#0c6780" }}>
                    <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                    Gemma AI matching your voice to the verse...
                  </div>
                )}

                {spokenTranscript && (
                  <div className="px-4 py-3 rounded-xl border text-xs font-bold max-w-md w-full text-center"
                    style={{ background: "#f5f3ef", borderColor: "#e4e2de", color: "#1b1c1a" }}>
                    <span style={{ color: "#705d00" }}>You Said: </span>"{spokenTranscript}"
                  </div>
                )}

                {voiceResult && (
                  <div className="rounded-3xl p-6 max-w-md w-full shadow-xl text-center space-y-3 border-2"
                    style={{ background: "white", borderColor: "#ffd700" }}>
                    <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-3xl font-black shadow-md"
                      style={{ background: "#ffd700", color: "#3d3300" }}>
                      {voiceResult.passed ? "🌟" : "📖"}
                    </div>
                    <h4 className="text-xl font-black" style={{ color: "#1b1c1a" }}>
                      {voiceResult.passed ? "Memory Verse Mastered!" : "Great Effort!"}
                    </h4>
                    <div className="flex justify-center gap-4 text-xs font-extrabold" style={{ color: "#705d00" }}>
                      <span>Accuracy: {voiceResult.accuracyPercent}%</span>
                      <span style={{ color: "#0c6780" }}>+{voiceResult.bonusSparkles} Seeds</span>
                    </div>
                    <p className="text-xs italic font-medium px-3 py-2 rounded-xl border"
                      style={{ background: "#fffde7", borderColor: "#e9c400", color: "#544600" }}>
                      🧸 Bible Teddy says: "{voiceResult.teddyFeedback}"
                    </p>
                    {voiceResult.aiSource === "gloo" && (
                      <p className="text-[10px] font-black" style={{ color: "#0c6780" }}>
                        Scored by Gloo AI ({voiceResult.aiModel || "Google Gemma"})
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─ SCRIPTURE TRIVIA ─ */}
          {activeQuizMode === "trivia" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b select-none" style={{ borderColor: "#e4e2de" }}>
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: "#705d00" }}>
                  Question {currentTriviaIdx + 1} of {TRIVIA_QUESTIONS.length}
                </span>
                <span className="text-xs font-black" style={{ color: "#0c6780" }}>{currentQ.verseRef}</span>
              </div>

              <h3 className="text-lg font-black select-none" style={{ color: "#1b1c1a" }}>{currentQ.prompt}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 select-none">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedAnswer === opt;
                  const isCorrect = opt === currentQ.correct;
                  let bg = "#f5f3ef", border = "#e4e2de", color = "#1b1c1a";
                  if (triviaSubmitted) {
                    if (isCorrect) { bg = "#d4edda"; border = "#28a745"; color = "#155724"; }
                    else if (isSelected) { bg = "#fce4e4"; border = "#ba1a1a"; color = "#7b0000"; }
                  }
                  return (
                    <button
                      key={i}
                      disabled={triviaSubmitted}
                      onClick={() => handleTriviaSubmit(opt)}
                      className="p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all cursor-pointer flex items-center justify-between font-bold"
                      style={{ background: bg, borderColor: border, color }}
                    >
                      <span>{opt}</span>
                      {triviaSubmitted && isCorrect && (
                        <span className="material-symbols-outlined text-base font-bold" style={{ color: "#28a745" }}>check_circle</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {triviaSubmitted && (
                <div className="space-y-3 select-none">
                  <div className="p-4 rounded-2xl border text-xs font-medium" style={{ background: "#fffde7", borderColor: "#e9c400", color: "#544600" }}>
                    <strong className="font-black" style={{ color: "#3d3300" }}>Explanation: </strong>
                    {currentQ.explanation}
                  </div>
                  <button
                    onClick={() => {
                      playSquish();
                      setCurrentTriviaIdx(prev => (prev + 1) % TRIVIA_QUESTIONS.length);
                      setSelectedAnswer(null);
                      setTriviaSubmitted(false);
                    }}
                    className="w-full py-4 rounded-2xl font-black text-sm cursor-pointer transition-all active:scale-95 squishy-button"
                    style={{ background: "#ffd700", color: "#3d3300", border: "1px solid #e9c400" }}
                  >
                    Next Question ▶
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. PARENT CURATED LIBRARY ── */}
      {curatedVideos.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4 select-none">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ background: "#ffd700", color: "#3d3300" }}>
              <span className="material-symbols-outlined text-lg">video_library</span>
            </div>
            <h2 className="text-2xl font-black" style={{ color: "#1b1c1a" }}>Parent's Curated Videos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {curatedVideos.map((v) => (
              <div key={v.id} className="soft-neomorph-card rounded-2xl overflow-hidden flex flex-col group border"
                style={{ borderColor: "#e4e2de", background: "white" }}>
                <div className="h-40 relative flex items-center justify-center overflow-hidden" style={{ background: "#1b1c1a" }}>
                  {v.thumbnailUrl && (
                    <img alt={v.title} src={v.thumbnailUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" />
                  )}
                  <div className="absolute w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-10 group-hover:scale-110 transition-transform"
                    style={{ background: "#ffd700", color: "#3d3300" }}>
                    <span className="material-symbols-outlined text-3xl font-bold ml-1" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3 flex-1 select-none">
                  <div>
                    <h3 className="font-black text-sm line-clamp-1" style={{ color: "#1b1c1a" }}>{v.title}</h3>
                    <p className="text-xs font-medium" style={{ color: "#4d4732" }}>Parent Curated Lesson</p>
                  </div>
                  <button onClick={() => { playSuccess(); router.push(`/kids/lesson?id=${v.id}&curated=true`); }}
                    className="w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer squishy-button"
                    style={{ background: "#ffd700", color: "#3d3300", border: "1px solid #e9c400" }}>
                    <span className="material-symbols-outlined text-sm font-bold">play_circle</span>
                    Watch &amp; Interactive Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
