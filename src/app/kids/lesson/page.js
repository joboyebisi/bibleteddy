"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import YouTubeQuestPlayer from "@/components/YouTubeQuestPlayer";

// ── Color tokens matching the Stained Glass Sparkle design system ──
const C = {
  gold:        "#ffd700",
  goldDark:    "#e9c400",
  goldDeep:    "#705d00",
  goldBg:      "#fffde7",
  goldFaint:   "#ffe16d",
  brown:       "#3d3300",
  brownMid:    "#544600",
  text:        "#1b1c1a",
  textMid:     "#4d4732",
  border:      "#d0c6ab",
  borderLight: "#e4e2de",
  surface:     "#fbf9f5",
  surfaceCard: "#f5f3ef",
  teal:        "#0c6780",
  tealLight:   "#9ae1ff",
  green:       "#155724",
  greenBg:     "#d4edda",
  greenBorder: "#28a745",
  red:         "#7b0000",
  redBg:       "#fce4e4",
  redBorder:   "#ba1a1a",
};

function LessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("id") || "christmas";
  const isCuratedParam = searchParams.get("curated") === "true";

  const { stories, curatedVideos, playSquish, playSuccess, addSeeds, logCheckpoint } = useApp();

  const [activeVideo, setActiveVideo] = useState(() => {
    if (isCuratedParam) {
      const found = curatedVideos.find((v) => String(v.id) === String(storyId));
      if (found) return found;
    }
    return stories.find((s) => s.id === storyId) || stories[0];
  });

  const [isPlaying, setIsPlaying]               = useState(false);
  const [currentTime, setCurrentTime]           = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [selectedOption, setSelectedOption]     = useState(null);
  const [quizSubmitted, setQuizSubmitted]       = useState(false);
  const [isCorrect, setIsCorrect]               = useState(false);
  const [completedCheckpoints, setCompletedCheckpoints] = useState([]);

  const [isListeningMic, setIsListeningMic]   = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [verifyingVoice, setVerifyingVoice]   = useState(false);

  const [customUrl, setCustomUrl]         = useState("");
  const [customTopic, setCustomTopic]     = useState("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Verse translation toggle
  const [verseMode, setVerseMode] = useState("kids"); // "kids" or "classic"
  const [liveVerseKids, setLiveVerseKids] = useState("");
  const [liveVerseClassic, setLiveVerseClassic] = useState("");
  const [verseApiSource, setVerseApiSource] = useState("");
  const [videoDuration, setVideoDuration] = useState(180);

  const playerApiRef = useRef(null);
  const triggeredCheckpointsRef = useRef(new Set());
  const activeCheckpointRef = useRef(null);
  const completedCheckpointsRef = useRef([]);

  useEffect(() => {
    activeCheckpointRef.current = activeCheckpoint;
  }, [activeCheckpoint]);

  useEffect(() => {
    completedCheckpointsRef.current = completedCheckpoints;
  }, [completedCheckpoints]);

  useEffect(() => {
    const found = stories.find((s) => s.id === storyId)
      || (isCuratedParam ? curatedVideos.find((v) => String(v.id) === String(storyId)) : null);
    if (found) {
      setActiveVideo(found);
      setCurrentTime(0);
      setIsPlaying(false);
      setActiveCheckpoint(null);
      setCompletedCheckpoints([]);
      triggeredCheckpointsRef.current = new Set();
      playerApiRef.current = null;
    }
  }, [storyId, isCuratedParam, stories, curatedVideos]);

  // Live scripture from YouVersion Platform API
  useEffect(() => {
    const ref = activeVideo?.verse;
    if (!ref) return;

    const load = async () => {
      try {
        const [icbRes, esvRes] = await Promise.all([
          fetch(`/api/youversion/verse?reference=${encodeURIComponent(ref)}&translation=ICB`),
          fetch(`/api/youversion/verse?reference=${encodeURIComponent(ref)}&translation=ESV`),
        ]);
        if (icbRes.ok) {
          const data = await icbRes.json();
          if (data.text) {
            setLiveVerseKids(data.text);
            if (data.source === "youversion") setVerseApiSource("youversion");
          }
        }
        if (esvRes.ok) {
          const data = await esvRes.json();
          if (data.text) setLiveVerseClassic(data.text);
        }
      } catch { /* use static copy */ }
    };
    load();
  }, [activeVideo?.verse]);

  const handleTimeUpdate = useCallback((t) => {
    const sec = Math.floor(t);
    setCurrentTime(sec);
    if (activeCheckpointRef.current) return;

    const cps = activeVideo.checkpoints || [];
    for (const cp of cps) {
      if (completedCheckpointsRef.current.includes(cp.id)) continue;
      if (triggeredCheckpointsRef.current.has(cp.id)) continue;
      if (sec >= cp.timeSeconds) {
        triggeredCheckpointsRef.current.add(cp.id);
        playerApiRef.current?.pause();
        setIsPlaying(false);
        setActiveCheckpoint(cp);
        playSquish();
        break;
      }
    }
  }, [activeVideo, playSquish]);

  const handlePlayerReady = useCallback((api) => {
    playerApiRef.current = api;
    const d = api.getDuration?.();
    if (d && Number.isFinite(d) && d > 0) setVideoDuration(Math.floor(d));
  }, []);

  const togglePlayback = () => {
    playSquish();
    if (isPlaying) {
      playerApiRef.current?.pause();
    } else {
      playerApiRef.current?.play();
    }
  };

  const startQuestFromBeginning = () => {
    triggeredCheckpointsRef.current = new Set();
    setCurrentTime(0);
    setActiveCheckpoint(null);
    setCompletedCheckpoints([]);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
    playerApiRef.current?.seekTo(0);
    playerApiRef.current?.play();
    playSuccess();
  };

  const handleAnswerSubmit = (optionText) => {
    if (!activeCheckpoint) return;
    setSelectedOption(optionText);
    setQuizSubmitted(true);
    const correct_ans = activeCheckpoint.question?.correctAnswer
      || activeCheckpoint.question?.options?.find(o => o.correct)?.text || "";
    const correct = optionText.trim().toLowerCase() === correct_ans.trim().toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      playSuccess();
      addSeeds(50);
      setCompletedCheckpoints(prev => [...prev, activeCheckpoint.id]);
      logCheckpoint?.(activeVideo.id, activeCheckpoint.id, true, 50, {
        storyTitle: activeVideo.title,
        checkpointTitle: activeCheckpoint.title,
      });
    } else {
      playSquish();
      logCheckpoint?.(activeVideo.id, activeCheckpoint.id, false, 0);
    }
  };

  const handleVoiceAnswer = async () => {
    if (!activeCheckpoint) return;
    playSquish();
    setSpokenTranscript("");
    const SpeechRecognition = typeof window !== "undefined"
      && (window.SpeechRecognition || window.webkitSpeechRecognition);

    const processTranscript = async (transcript) => {
      setSpokenTranscript(transcript);
      setIsListeningMic(false);
      setVerifyingVoice(true);
      try {
        // Use Gloo AI voice-match API
        const res = await fetch("/api/gloo/voice-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spokenText: transcript,
            targetVerse: activeCheckpoint.verseSnippet || activeCheckpoint.question?.prompt || "",
            verseReference: activeCheckpoint.title || ""
          })
        });
        const matchData = await res.json();
        setVerifyingVoice(false);
        // Match against question options if it's a quiz checkpoint
        const options = activeCheckpoint.question?.options || [];
        const matched = options.find(o => transcript.toLowerCase().includes(String(o).toLowerCase()));
        if (matched) handleAnswerSubmit(typeof matched === "string" ? matched : matched.text || matched);
        else {
          const fallback = activeCheckpoint.question?.correctAnswer || options[0];
          handleAnswerSubmit(typeof fallback === "string" ? fallback : fallback?.text || fallback);
        }
      } catch {
        setVerifyingVoice(false);
        const fallback = activeCheckpoint.question?.correctAnswer || (activeCheckpoint.question?.options?.[0]);
        handleAnswerSubmit(typeof fallback === "string" ? fallback : fallback?.text || fallback);
      }
    };

    if (!SpeechRecognition) {
      setIsListeningMic(true);
      setTimeout(async () => {
        const fallback = activeCheckpoint.question?.correctAnswer
          || activeCheckpoint.question?.options?.find(o => o.correct)?.text || "Bethlehem";
        await processTranscript(fallback);
      }, 2000);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setIsListeningMic(true);
    recognition.start();
    recognition.onresult = async (event) => {
      await processTranscript(event.results[0][0].transcript);
    };
    recognition.onerror = () => { setIsListeningMic(false); setVerifyingVoice(false); };
  };

  const handleContinueVideo = () => {
    setActiveCheckpoint(null);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
    playerApiRef.current?.play();
  };

  const handleGenerateAiCheckpoints = async () => {
    if (!customTopic && !customUrl) return;
    setIsGeneratingAi(true);
    try {
      const res = await fetch("/api/curate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: customUrl || "https://www.youtube.com/watch?v=1fl9laM4ViM", topic: customTopic || "Bible Story" })
      });
      const data = await res.json();
      if (data.story) {
        setActiveVideo(data.story);
        setCurrentTime(0);
        setCompletedCheckpoints([]);
        triggeredCheckpointsRef.current = new Set();
        playerApiRef.current?.seekTo(0);
        playerApiRef.current?.play();
        playSuccess();
      }
    } catch (e) { console.error(e); }
    finally { setIsGeneratingAi(false); }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const checkpoints = activeVideo.checkpoints || [];
  const duration = videoDuration || activeVideo.durationSeconds || 180;
  const progressPercent = Math.min((currentTime / duration) * 100, 100);

  return (
    <div className="px-4 md:px-8 py-6 space-y-6 max-w-7xl mx-auto">

      {/* ── HEADER BANNER ── */}
      <div className="rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-2 select-none"
        style={{ background: "white", borderColor: C.border, boxShadow: `0 20px 40px -15px rgba(112,93,0,0.12)` }}>
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black mb-2 border"
            style={{ background: C.goldFaint, color: C.brownMid, borderColor: C.goldDark }}>
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1", color: "#ba1a1a" }}>play_circle</span>
            Video2App Micro-Learning Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-black leading-tight" style={{ color: C.text }}>
            Interactive Scripture Video Player
          </h1>
          <p className="text-xs font-medium mt-1 max-w-lg" style={{ color: C.textMid }}>
            Videos auto-pause at glowing checkpoints for fun scripture quizzes. Answer to continue!
          </p>
        </div>

        {/* Episode Switcher Pills */}
        <div className="flex flex-wrap gap-2">
          {stories.map((vid) => {
            const active = vid.id === activeVideo.id;
            return (
              <button key={vid.id}
                onClick={() => {
                  playSquish();
                  setActiveVideo(vid);
                  setCurrentTime(0);
                  setIsPlaying(false);
                  setActiveCheckpoint(null);
                  setCompletedCheckpoints([]);
                  triggeredCheckpointsRef.current = new Set();
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border"
                style={active
                  ? { background: C.gold, color: C.brown, fontWeight: 900, borderColor: C.goldDark, boxShadow: `0 4px 12px rgba(255,215,0,0.4)` }
                  : { background: C.surfaceCard, color: C.textMid, borderColor: C.borderLight }
                }
              >
                {vid.title.replace("Superbook: ", "")}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Video Player + Quiz Overlay (8 cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* ── VIDEO PLAYER CONTAINER ── */}
          <div className="relative aspect-video rounded-3xl border-4 overflow-hidden group"
            style={{ background: "#0d0d0d", borderColor: activeCheckpoint ? "#ba1a1a" : C.goldDark, boxShadow: `0 20px 50px rgba(0,0,0,0.4)` }}>

            {activeVideo.youtubeId ? (
              <YouTubeQuestPlayer
                videoId={activeVideo.youtubeId}
                onReady={handlePlayerReady}
                onTimeUpdate={handleTimeUpdate}
                onDurationChange={(d) => d > 0 && setVideoDuration(Math.floor(d))}
                onPlayingChange={setIsPlaying}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm font-bold">
                No video linked for this quest
              </div>
            )}

            {/* CHECKPOINT MODAL OVERLAY */}
            {activeCheckpoint && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-4 sm:p-8"
                style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.92) 100%)", backdropFilter: "blur(6px)" }}>

                <div className="w-full max-w-md space-y-5 animate-in">
                  {/* Checkpoint badge */}
                  <div className="flex items-center gap-2 justify-center select-none">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border"
                      style={{ background: C.gold, color: C.brown, borderColor: C.goldDark }}>
                      <span className="material-symbols-outlined text-sm align-middle mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>quiz</span>
                      Checkpoint! Video Paused
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-white text-xl font-black text-center">
                    {activeCheckpoint.title || "Quick Bible Quiz!"}
                  </h2>

                  {/* Verse quote */}
                  {activeCheckpoint.verseSnippet && (
                    <div className="rounded-xl p-3 text-center border"
                      style={{ background: "rgba(255,215,0,0.1)", borderColor: "rgba(255,215,0,0.3)" }}>
                      <p className="text-xs italic font-bold" style={{ color: C.gold }}>
                        "{activeCheckpoint.verseSnippet}"
                      </p>
                    </div>
                  )}

                  {/* Question */}
                  <p className="text-sm font-black text-white text-center">
                    {activeCheckpoint.question?.prompt || "What did you just learn?"}
                  </p>

                  {!quizSubmitted ? (
                    <>
                      {/* Answer options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(activeCheckpoint.question?.options || []).map((opt, i) => {
                          const text = typeof opt === "string" ? opt : opt.text;
                          return (
                            <button key={i} onClick={() => handleAnswerSubmit(text)}
                              className="px-4 py-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border"
                              style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)", color: "white" }}
                              onMouseEnter={e => { e.currentTarget.style.background = `rgba(255,215,0,0.2)`; e.currentTarget.style.borderColor = C.goldDark; }}
                              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
                            >
                              {text}
                            </button>
                          );
                        })}
                      </div>

                      {/* Voice Answer Button */}
                      <button onClick={handleVoiceAnswer} disabled={isListeningMic || verifyingVoice}
                        className="w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer border"
                        style={{ background: isListeningMic ? "#ba1a1a" : "rgba(255,255,255,0.08)", color: "white", borderColor: "rgba(255,255,255,0.2)" }}>
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                        {isListeningMic ? "🎤 Listening..." : verifyingVoice ? "🧠 Gemma Verifying..." : "Answer with Your Voice!"}
                      </button>
                    </>
                  ) : (
                    /* Result Panel */
                    <div className="rounded-2xl p-5 text-center space-y-3 border"
                      style={isCorrect
                        ? { background: "rgba(21,87,36,0.3)", borderColor: "#28a745" }
                        : { background: "rgba(123,0,0,0.3)", borderColor: "#ba1a1a" }
                      }>
                      <div className="text-4xl">{isCorrect ? "🌟" : "📖"}</div>
                      <h3 className="text-base font-black text-white">
                        {isCorrect ? "Correct! +50 Faith Seeds!" : "Not quite — let's keep learning!"}
                      </h3>
                      {activeCheckpoint.question?.explanation && (
                        <p className="text-xs font-medium text-white/80">{activeCheckpoint.question.explanation}</p>
                      )}
                      <button onClick={handleContinueVideo}
                        className="w-full py-3 rounded-xl text-sm font-black cursor-pointer transition-all border"
                        style={{ background: C.gold, color: C.brown, borderColor: C.goldDark }}>
                        <span className="material-symbols-outlined text-sm mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                        Continue Watching ▶
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── PLAYBACK CONTROLS ── */}
          <p className="text-xs font-bold text-center px-2" style={{ color: C.textMid }}>
            Checkpoints sync with the video — when the story reaches a key moment, your quiz pops up automatically.
          </p>
          <div className="rounded-2xl p-5 border select-none"
            style={{ background: "white", borderColor: C.border, boxShadow: "0 10px 30px -10px rgba(112,93,0,0.10)" }}>

            {/* Simulated Progress Bar */}
            <div className="relative h-3 rounded-full mb-4 overflow-hidden"
              style={{ background: C.borderLight }}>
              {/* Checkpoint dots */}
              {checkpoints.map(cp => (
                <div key={cp.id}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white z-10"
                  style={{ left: `${(cp.timeSeconds / duration) * 100}%`, background: completedCheckpoints.includes(cp.id) ? C.goldDeep : "#ba1a1a", boxShadow: `0 0 8px ${completedCheckpoints.includes(cp.id) ? C.gold : "#ba1a1a"}` }}
                  title={cp.title}
                />
              ))}
              <div className="absolute inset-0 rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%`, background: `linear-gradient(90deg,${C.gold},${C.goldDark})` }} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Play/Pause Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer squishy-button"
                  style={{ background: C.gold, borderColor: C.goldDark, color: C.brown }}>
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isPlaying ? "pause" : "play_arrow"}
                  </span>
                </button>
                <div>
                  <p className="text-xs font-black truncate max-w-[200px]" style={{ color: C.text }}>
                    {activeVideo.title}
                  </p>
                  <p className="text-[10px] font-bold" style={{ color: C.textMid }}>
                    {formatTime(currentTime)} / {formatTime(duration)} • YouTube
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs font-bold" style={{ color: C.textMid }}>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ color: "#ba1a1a" }}>quiz</span>
                  {completedCheckpoints.length}/{checkpoints.length} Checkpoints
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm" style={{ color: C.goldDeep, fontVariationSettings: "'FILL' 1" }}>star</span>
                  {completedCheckpoints.length * 50} Seeds
                </span>
              </div>
            </div>
          </div>

          {/* ── CHECKPOINT TIMELINE ── */}
          {checkpoints.length > 0 && (
            <div className="rounded-2xl p-5 border select-none"
              style={{ background: "white", borderColor: C.border }}>
              <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: C.text }}>
                <span className="material-symbols-outlined text-base" style={{ color: C.goldDeep }}>timeline</span>
                Video Checkpoints
              </h3>
              <div className="space-y-2">
                {checkpoints.map((cp) => {
                  const done = completedCheckpoints.includes(cp.id);
                  const active = activeCheckpoint?.id === cp.id;
                  return (
                    <div key={cp.id} className="flex items-start gap-3 p-3 rounded-xl border transition-all"
                      style={active
                        ? { background: C.goldFaint, borderColor: C.goldDark }
                        : done
                        ? { background: C.greenBg, borderColor: C.greenBorder }
                        : { background: C.surfaceCard, borderColor: C.borderLight }
                      }>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-black"
                        style={done
                          ? { background: C.greenBorder, color: "white" }
                          : active
                          ? { background: "#ba1a1a", color: "white" }
                          : { background: C.border, color: C.textMid }
                        }>
                        {done ? "✓" : active ? "!" : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black truncate" style={{ color: C.text }}>{cp.title}</h4>
                        <p className="text-[10px] font-medium" style={{ color: C.textMid }}>
                          At {formatTime(cp.timeSeconds)} • {cp.question?.prompt?.substring(0, 55)}...
                        </p>
                      </div>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full border"
                        style={done ? { background: C.greenBg, color: C.green, borderColor: C.greenBorder } : { background: C.goldFaint, color: C.brownMid, borderColor: C.goldDark }}>
                        {done ? "+50 Seeds" : formatTime(cp.timeSeconds)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE PANEL (4 cols) */}
        <div className="lg:col-span-4 space-y-5">

          {/* ── EPISODE INFO CARD ── */}
          <div className="rounded-3xl p-5 border-2 select-none"
            style={{ background: "white", borderColor: C.border, boxShadow: "0 20px 40px -15px rgba(112,93,0,0.12)" }}>

            <div className="flex items-center gap-1.5 mb-3">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border"
                style={{ background: C.goldFaint, color: C.brownMid, borderColor: C.goldDark }}>
                {activeVideo.category || "HERO STORIES"}
              </span>
              <span className="text-[10px] font-black ml-auto" style={{ color: C.textMid }}>
                {activeVideo.era || "Old Testament"}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                style={{ background: `linear-gradient(135deg,${C.gold},#ffe566)` }}>
                <span className="material-symbols-outlined text-2xl font-bold" style={{ color: C.brown }}>
                  {activeVideo.mapIcon || "child_care"}
                </span>
              </div>
              <h2 className="text-base font-black leading-tight" style={{ color: C.text }}>
                {activeVideo.title}
              </h2>
            </div>

            <p className="text-xs font-medium leading-relaxed px-3 py-2.5 rounded-xl border mb-4"
              style={{ background: C.surfaceCard, borderColor: C.borderLight, color: C.textMid }}>
              {activeVideo.desc}
            </p>

            {/* ── SCRIPTURE PANEL with YouVersion Tabs ── */}
            <div className="rounded-2xl border-2 overflow-hidden mb-4"
              style={{ borderColor: C.goldDark }}>
              <div className="flex border-b" style={{ borderColor: C.goldDark }}>
                {["kids", "classic"].map((mode) => (
                  <button key={mode}
                    onClick={() => { playSquish(); setVerseMode(mode); }}
                    className="flex-1 py-2 text-xs font-black capitalize transition-all cursor-pointer"
                    style={verseMode === mode
                      ? { background: C.gold, color: C.brown }
                      : { background: C.goldBg, color: C.textMid }
                    }>
                    {mode === "kids" ? "🧒 Kids (ICB)" : "📖 Classic (ESV)"}
                  </button>
                ))}
              </div>
              <div className="p-4" style={{ background: C.goldBg }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1" style={{ color: C.goldDeep }}>
                  <span className="material-symbols-outlined text-xs">menu_book</span>
                  {activeVideo.verse}
                </p>
                <p className="text-sm italic font-bold leading-relaxed" style={{ color: C.brownMid }}>
                  "{verseMode === "kids"
                    ? (liveVerseKids || activeVideo.translationKids || activeVideo.translationClassic || "God is with you wherever you go.")
                    : (liveVerseClassic || activeVideo.translationClassic || activeVideo.translationKids || "The Lord is my shepherd; I shall not want.")
                  }"
                </p>
                <p className="text-[9px] font-black mt-2 flex items-center gap-1" style={{ color: C.goldDeep }}>
                  <span className="material-symbols-outlined text-[10px]">link</span>
                  {verseApiSource === "youversion"
                    ? "YouVersion Platform API (live ICB / ESV)"
                    : "YouVersion Platform API"}
                </p>
              </div>
            </div>

            {/* Stars Progress */}
            <div className="flex items-center justify-between mb-5 select-none">
              <span className="text-xs font-black" style={{ color: C.goldDeep }}>Lesson Stars</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(s => (
                  <span key={s} className="material-symbols-outlined text-xl"
                    style={{ fontVariationSettings: s <= (activeVideo.stars || 0) ? "'FILL' 1" : "'FILL' 0", color: s <= (activeVideo.stars || 0) ? C.goldDark : C.borderLight }}>
                    star
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={startQuestFromBeginning}
              className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer squishy-button border"
              style={{ background: `linear-gradient(135deg,${C.gold},#f5c800)`, color: C.brown, borderColor: C.goldDark }}>
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              Start Quest from Beginning
            </button>
          </div>

          {/* ── AI CHECKPOINT GENERATOR ── */}
          <div className="rounded-3xl p-5 border-2 select-none"
            style={{ background: "white", borderColor: C.border }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg,#1a73e8,#0c6780)`, color: "white" }}>
                <span className="material-symbols-outlined text-base font-bold">auto_awesome</span>
              </div>
              <div>
                <h3 className="text-sm font-black" style={{ color: C.text }}>Gemini AI Lesson Generator</h3>
                <p className="text-[10px] font-bold" style={{ color: C.textMid }}>Parse any YouTube Bible video</p>
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="Paste YouTube URL (e.g. Superbook ep.)"
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none input-inset"
                style={{ background: C.surfaceCard, borderColor: C.borderLight, color: C.text }}
              />
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="Topic (e.g. Noah, Moses, Jesus Heals)"
                className="w-full px-3 py-2.5 rounded-xl text-xs font-medium border outline-none input-inset"
                style={{ background: C.surfaceCard, borderColor: C.borderLight, color: C.text }}
              />
              <button
                disabled={isGeneratingAi || (!customUrl && !customTopic)}
                onClick={handleGenerateAiCheckpoints}
                className="w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer border transition-all disabled:opacity-50"
                style={{ background: isGeneratingAi ? C.surfaceCard : "linear-gradient(135deg,#1a73e8,#0c6780)", color: "white", borderColor: "#0c6780" }}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isGeneratingAi ? "sync" : "bolt"}
                </span>
                {isGeneratingAi ? "Gemini Analyzing Video..." : "Generate Interactive Lesson"}
              </button>
            </div>
          </div>

          {/* ── BACK BUTTON ── */}
          <button
            onClick={() => { playSquish(); router.back(); }}
            className="w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer border transition-all select-none"
            style={{ background: "white", color: C.textMid, borderColor: C.border }}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Adventure Map
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#fbf9f5" }}>
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full mx-auto animate-spin border-4 border-t-transparent"
            style={{ borderColor: "#ffd700", borderTopColor: "transparent" }} />
          <p className="text-sm font-black" style={{ color: "#705d00" }}>Loading your Bible Quest…</p>
        </div>
      </div>
    }>
      <LessonContent />
    </Suspense>
  );
}
