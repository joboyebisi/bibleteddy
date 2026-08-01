"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchVerseOfDayLive,
  formatVotdDate,
  getTodayKey,
  readVotdCache,
  writeVotdCache,
} from "@/lib/verseOfDayClient";

/**
 * YouVersion Verse of the Day — live API text, cached per calendar day.
 */
export default function VerseOfDayCard({ compact = false }) {
  const [verse, setVerse] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [displayDate, setDisplayDate] = useState(formatVotdDate());
  const lastDayRef = useRef(getTodayKey());

  const loadVerse = useCallback(async (force = false) => {
    const today = getTodayKey();
    lastDayRef.current = today;
    setDisplayDate(formatVotdDate());

    const cached = !force ? readVotdCache() : null;
    if (cached?.text) {
      setVerse(cached);
      setStatus("ready");
    } else {
      setStatus("loading");
    }

    try {
      const data = await fetchVerseOfDayLive();
      if (data?.text) {
        setVerse(data);
        writeVotdCache(data);
        setStatus("ready");
      } else if (!cached?.text) {
        setStatus("error");
      }
    } catch {
      if (!cached?.text) setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadVerse(false);

    const onDayChange = () => {
      const today = getTodayKey();
      if (today !== lastDayRef.current) loadVerse(true);
    };

    const interval = setInterval(onDayChange, 60_000);
    document.addEventListener("visibilitychange", onDayChange);
    window.addEventListener("focus", onDayChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onDayChange);
      window.removeEventListener("focus", onDayChange);
    };
  }, [loadVerse]);

  const isLive = verse?.source === "youversion";
  const reference = verse?.reference || "…";
  const translation = verse?.translation || "ICB";

  if (compact) {
    return (
      <div
        className="rounded-2xl border-2 p-4 select-none"
        style={{
          background: "linear-gradient(135deg, #fff8f0 0%, #ffffff 100%)",
          borderColor: "rgba(255,102,0,0.35)",
          boxShadow: "0 8px 24px -8px rgba(255,102,0,0.15)",
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
            style={{ color: "#ff6600" }}>
            <span className="material-symbols-outlined text-sm">today</span>
            Verse of the Day
          </span>
          {isLive && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#0c6780", color: "white" }}>
              YouVersion
            </span>
          )}
        </div>
        {status === "loading" && !verse?.text ? (
          <div className="animate-pulse space-y-2">
            <div className="h-3 bg-orange-100 rounded w-1/3" />
            <div className="h-4 bg-orange-50 rounded w-full" />
          </div>
        ) : (
          <>
            <p className="text-xs font-black mb-1" style={{ color: "#3d3300" }}>{reference}</p>
            <p className="text-sm italic font-medium leading-snug" style={{ color: "#544600" }}>
              &ldquo;{verse?.text}&rdquo;
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <section
      className="rounded-3xl border-2 overflow-hidden select-none"
      style={{
        background: "linear-gradient(145deg, #fffaf5 0%, #ffffff 55%, #fff5eb 100%)",
        borderColor: "rgba(255,102,0,0.4)",
        boxShadow: "0 16px 40px -12px rgba(255,102,0,0.2)",
      }}
    >
      {/* Header strip */}
      <div
        className="px-5 py-3 flex flex-wrap items-center justify-between gap-3 border-b"
        style={{
          background: "linear-gradient(90deg, rgba(255,102,0,0.12), rgba(255,215,0,0.08))",
          borderColor: "rgba(255,102,0,0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#ff6600", color: "white" }}
          >
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
              today
            </span>
          </div>
          <div>
            <h2 className="text-sm font-black leading-tight" style={{ color: "#c2410c" }}>
              YouVersion Verse of the Day
            </h2>
            <p className="text-[11px] font-semibold" style={{ color: "#9a3412" }}>
              {displayDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <span
              className="text-[10px] font-black uppercase tracking-wide px-3 py-1 rounded-full flex items-center gap-1"
              style={{ background: "#0c6780", color: "white" }}
            >
              <span className="material-symbols-outlined text-xs">verified</span>
              Live API
            </span>
          ) : status === "ready" ? (
            <span
              className="text-[10px] font-bold px-3 py-1 rounded-full"
              style={{ background: "#ffe16d", color: "#544600" }}
            >
              Offline copy
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => loadVerse(true)}
            disabled={status === "loading"}
            className="p-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50"
            style={{ borderColor: "rgba(255,102,0,0.25)", color: "#ff6600", background: "white" }}
            title="Refresh today's verse"
            aria-label="Refresh Verse of the Day"
          >
            <span className={`material-symbols-outlined text-lg ${status === "loading" ? "animate-spin" : ""}`}>
              sync
            </span>
          </button>
        </div>
      </div>

      {/* Verse text box */}
      <div className="p-5 md:p-6">
        <div
          className="rounded-2xl p-5 md:p-6 min-h-[120px] border-2 transition-all duration-300"
          style={{
            background: "white",
            borderColor: isLive ? "rgba(12,103,128,0.25)" : "rgba(255,102,0,0.2)",
            boxShadow: "inset 0 2px 12px rgba(255,102,0,0.04)",
          }}
        >
          {status === "loading" && !verse?.text ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 rounded-lg w-32" style={{ background: "#ffedd5" }} />
              <div className="h-5 rounded-lg w-full" style={{ background: "#fff7ed" }} />
              <div className="h-5 rounded-lg w-11/12" style={{ background: "#fff7ed" }} />
              <div className="h-5 rounded-lg w-4/5" style={{ background: "#fff7ed" }} />
            </div>
          ) : status === "error" && !verse?.text ? (
            <p className="text-sm font-medium text-center py-4" style={{ color: "#9a3412" }}>
              Could not load today&apos;s verse. Tap refresh to try again.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <p className="text-lg md:text-xl font-black" style={{ color: "#c2410c" }}>
                  {reference}
                </p>
                <span
                  className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full border"
                  style={{
                    background: "#fff7ed",
                    color: "#9a3412",
                    borderColor: "rgba(255,102,0,0.25)",
                  }}
                >
                  {translation} • Kids Bible
                </span>
              </div>
              <p
                className="text-base md:text-lg italic font-bold leading-relaxed"
                style={{ color: "#431407" }}
              >
                &ldquo;{verse?.text}&rdquo;
              </p>
              {verse?.copyright && (
                <p className="text-[10px] font-medium mt-4 pt-3 border-t" style={{ color: "#78716c", borderColor: "#f5f5f4" }}>
                  {verse.copyright}
                </p>
              )}
            </>
          )}
        </div>

        <p className="text-[11px] font-medium mt-3 text-center" style={{ color: "#a8a29e" }}>
          Updates automatically each day • Powered by{" "}
          <a
            href="https://www.bible.com/verse-of-the-day"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline"
            style={{ color: "#ff6600" }}
          >
            YouVersion
          </a>
        </p>
      </div>
    </section>
  );
}
