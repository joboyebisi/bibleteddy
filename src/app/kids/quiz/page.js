"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import confetti from "canvas-confetti";

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get("id") || "david";
  const isCuratedParam = searchParams.get("curated") === "true";

  const { stories, curatedVideos, playSquish, playSuccess, addBadge, addSeeds, activeChild } = useApp();

  // Find active story quiz
  let activeStory = null;
  if (isCuratedParam) {
    const video = curatedVideos.find((v) => v.id === storyId);
    activeStory = video
      ? {
          id: video.id,
          title: video.title,
          quiz: video.quiz_questions
        }
      : null;
  } else {
    activeStory = stories.find((s) => s.id === storyId);
  }

  // Fallback
  if (!activeStory) {
    activeStory = stories[0];
  }

  const quiz = activeStory.quiz;

  const [selectedOption, setSelectedOption] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [incorrectSelection, setIncorrectSelection] = useState(null);

  // Micro-interaction for microphone simulation
  const handleMicClick = () => {
    playSquish();
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    // Simulate speech processing and matching the correct answer after 2.5 seconds
    setTimeout(() => {
      setIsListening(false);
      // Find the correct option
      const correctOpt = quiz.options.find((o) => o.correct);
      if (correctOpt) {
        handleOptionSelect(correctOpt);
      }
    }, 2500);
  };

  const handleOptionSelect = (option) => {
    if (showCelebration) return;

    if (option.correct) {
      setSelectedOption(option.key);
      setIncorrectSelection(null);
      
      // Play sound
      playSuccess();
      
      // Trigger confetti
      triggerConfettiGlow();

      // Show celebration dialog
      setTimeout(() => {
        setShowCelebration(true);
      }, 1000);
    } else {
      playSquish(); // plays a soft error squish note
      setIncorrectSelection(option.key);
      setTimeout(() => setIncorrectSelection(null), 1000);
    }
  };

  const triggerConfettiGlow = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffd700", "#9ae1ff", "#d8d8ec", "#ffdad6"]
    });
  };

  const handleEarnBadge = async () => {
    playSquish();
    // Add badge and 50 bonus seeds
    await addBadge(quiz.badge);
    await addSeeds(20); // 20 standard quiz seeds
    router.push("/kids/badges");
  };

  return (
    <div className="px-margin-mobile md:px-margin-desktop py-sm flex flex-col flex-1 items-center relative overflow-hidden mt-4">
      {/* Top Header & Progress */}
      <header className="w-full max-w-4xl flex flex-col items-center mb-lg select-none">
        <div className="w-full flex justify-between items-center mb-sm px-sm font-bold text-xs">
          <span className="font-headline-md text-headline-md text-primary font-bold">Question 3 of 5</span>
          <div className="flex items-center gap-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-primary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <span className="font-label-caps text-label-caps font-bold">{activeChild?.seeds || 150} Seeds</span>
          </div>
        </div>
        
        <div className="h-4 w-full bg-surface-container-high rounded-full overflow-hidden border border-white">
          <div className="h-full bg-primary-container w-[60%] rounded-full progress-glow relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </header>

      {/* Question Section */}
      <section className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-center gap-lg md:gap-xl mt-4 select-none">
        {/* Teddy & Speech Bubble */}
        <div className="flex flex-col md:flex-row items-center gap-base relative w-full justify-center">
          {/* Mascot Image */}
          <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-8 border-white shadow-xl flex-shrink-0 z-10">
            <img
              alt="Bible Teddy Mascot"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
            />
          </div>
          {/* Speech Bubble */}
          <div className="speech-bubble p-md md:p-lg max-w-lg shadow-lg border border-white flex-grow">
            <h2 className="font-display-lg-mobile md:text-headline-md text-primary text-center md:text-left leading-snug font-bold">
              {quiz.question}
            </h2>
          </div>
        </div>
      </section>

      {/* Quiz Answer Options (Bento Style) */}
      <section className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-md mt-lg">
        {quiz.options.map((opt) => {
          const isCorrectSelected = selectedOption === opt.key;
          const isIncorrectSelected = incorrectSelection === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => handleOptionSelect(opt)}
              className={`soft-card p-lg rounded-xl flex items-center gap-md text-left group cursor-pointer border-4 bg-white transition-all duration-300 ${
                isCorrectSelected
                  ? "sparkle-active border-primary bg-primary/5 scale-102"
                  : isIncorrectSelected
                  ? "border-error ring-4 ring-error/15 bg-error/5 animate-shake"
                  : "border-transparent hover:border-secondary-container hover:scale-[1.01]"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform shrink-0 shadow-inner ${
                  isCorrectSelected
                    ? "bg-primary-container text-on-primary-container scale-110"
                    : "bg-surface-container text-on-surface-variant group-hover:scale-105"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[28px]"
                  style={{ fontVariationSettings: isCorrectSelected ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {opt.icon}
                </span>
              </div>
              
              <div className="overflow-hidden">
                <span className={`font-label-caps text-xs block mb-xs font-bold ${isCorrectSelected ? "text-primary" : "text-on-surface-variant/60"}`}>
                  OPTION {opt.key}
                </span>
                <span className={`font-headline-md text-base leading-normal font-bold truncate ${isCorrectSelected ? "text-primary" : "text-on-surface"}`}>
                  {opt.text}
                </span>
              </div>
            </button>
          );
        })}
      </section>

      {/* Voice Interaction & Action Button */}
      <section className="mt-xl mb-xl flex flex-col items-center gap-base select-none">
        <button
          onClick={handleMicClick}
          className={`squish-button w-20 h-20 rounded-full flex items-center justify-center relative shadow-lg cursor-pointer ${
            isListening ? "bg-secondary text-on-secondary animate-pulse" : "bg-primary-container text-on-primary-container pulse-glow"
          }`}
        >
          {isListening ? (
            <span className="material-symbols-outlined text-4xl animate-bounce">graphic_eq</span>
          ) : (
            <span className="material-symbols-outlined text-4xl">mic</span>
          )}
        </button>
        
        <p className="font-body-lg text-sm text-on-surface-variant animate-pulse font-medium">
          {isListening ? "Listening for your voice..." : "Tap or Speak your answer!"}
        </p>
      </section>

      {/* Celebration Congratulations Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-sm animate-fade-in">
          <div className="bg-white rounded-xl p-lg max-w-md w-full soft-neomorph border-4 border-primary-container shadow-2xl text-center transform scale-100 flex flex-col items-center gap-md">
            <h2 className="font-display-lg-mobile text-primary font-bold animate-bounce">
              🎉 Fantastic Job! 🎉
            </h2>
            
            <div className="relative w-44 h-44 mb-sm select-none">
              <div className="absolute inset-0 bg-primary-container/20 rounded-full blur-xl animate-pulse"></div>
              <img
                alt="Bible Teddy Mascot celebrating"
                className="w-full h-full object-contain floating relative z-10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBX654Vex9iHioTi86dUp3WTbzpAT89jvU0qJRqrSt4EZ3LD0wCbkQcX37Tf9Wk69d1Oz1HH2hueuYkH4_Oe-e8qgIA6CfmdTQa1c2BvNP23qe7qqD-l_z5OXOz0DBpHqAmlEr2ID7rdJG-_TmusbjaEmoL_wZ8VHOSNWqbYVy_YF-QpWL5Q4iRGRlF9kDEmdS7yUmP028WKHCpPW6eQwCzNtXHw0VnTPTaT_4djIuDBCQ4OFrW5AOIjw"
              />
            </div>

            <div className="space-y-xs">
              <p className="font-body-lg text-on-surface font-bold text-lg">
                You earned the <span className="text-secondary font-bold">{quiz.badge} Badge</span>!
              </p>
              <p className="font-body-md text-on-surface-variant font-medium">
                And got <strong className="text-primary">+50 Seeds</strong> for your YouVersion profile!
              </p>
            </div>

            <button
              onClick={handleEarnBadge}
              className="squishy-button w-full py-4 bg-primary-container text-on-primary-container rounded-full font-headline-md font-bold shadow-lg hover:brightness-105 transition-all cursor-pointer border-b-4 border-primary"
            >
              Collect Badge &amp; Coins!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KidsQuizPage() {
  return (
    <Suspense fallback={<div className="p-xl text-center text-primary font-bold">Loading Quiz...</div>}>
      <QuizContent />
    </Suspense>
  );
}
