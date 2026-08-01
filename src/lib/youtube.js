/**
 * Best-effort YouTube video duration lookup for checkpoint placement.
 */

/** Parse ISO 8601 duration (PT1H2M3S) to seconds. */
export function parseIso8601Duration(iso) {
  if (!iso || typeof iso !== "string") return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/** Fetch duration via YouTube Data API when GEMINI/YOUTUBE key available. */
export async function fetchYouTubeDurationSeconds(youtubeId) {
  if (!youtubeId) return null;

  const apiKey = process.env.YOUTUBE_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${encodeURIComponent(youtubeId)}&key=${apiKey}`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const iso = data.items?.[0]?.contentDetails?.duration;
    return parseIso8601Duration(iso);
  } catch {
    return null;
  }
}

/** Known Superbook full-episode fallbacks (seconds). */
const KNOWN_DURATIONS = {
  "1fl9laM4ViM": 1500,
  "8m9gSjV6o2Y": 1500,
  EQXyhM592RU: 1680,
  l54IvPzqXJM: 1680,
  "0o8NQBuneJM": 1560,
  J2Xod4D5UwQ: 1620,
  "3F0rt2AiqJY": 1620,
  RG9_g772vK0: 1500,
  "32_Izk21ktw": 1500,
};

export function guessYouTubeDuration(youtubeId, estimatedSeconds) {
  if (estimatedSeconds && estimatedSeconds > 60) return estimatedSeconds;
  if (youtubeId && KNOWN_DURATIONS[youtubeId]) return KNOWN_DURATIONS[youtubeId];
  return 600;
}

export async function resolveVideoDuration(youtubeId, estimatedSeconds) {
  const fetched = await fetchYouTubeDurationSeconds(youtubeId);
  return guessYouTubeDuration(youtubeId, fetched || estimatedSeconds);
}
