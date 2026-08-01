/** Client-side helpers for YouVersion Verse of the Day (refreshes daily). */

const CACHE_KEY = "btb_votd_cache";

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function formatVotdDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function readVotdCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.dateKey === getTodayKey()) return parsed.data;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeVotdCache(data) {
  if (typeof window === "undefined" || !data) return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ dateKey: getTodayKey(), data })
    );
  } catch {
    /* ignore */
  }
}

export async function fetchVerseOfDayLive() {
  const res = await fetch("/api/youversion/verse?votd=1", {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Verse of the Day unavailable");
  return res.json();
}
