import { getYouVersionConfig } from "@/lib/youversion/config";
import { BIBLE_IDS, KID_TRANSLATION_TRY_ORDER } from "@/lib/youversion/bibles";
import { referenceToPassageId } from "@/lib/youversion/passage";

function buildHeaders(appKey) {
  return {
    "X-YVP-App-Key": appKey,
    Accept: "application/json",
    "Accept-Language": "en",
  };
}

export function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizePassageResponse(data, reference, translation) {
  const text = stripHtml(
    data.content || data.passage?.content || data.text || ""
  );
  const ref =
    (typeof data.reference === "string" && data.reference) ||
    data.reference?.human ||
    data.human_reference ||
    reference;

  return {
    reference: ref,
    translation,
    text,
    copyright: data.copyright || `YouVersion • ${translation}`,
    source: "youversion",
  };
}

/**
 * Fetch a passage, trying kid-friendly Bible IDs until one succeeds.
 */
export async function fetchPassage(reference, preferredTranslation = "ICB") {
  const appKey = getYouVersionConfig().appKey;
  if (!appKey) return null;

  const passageId = referenceToPassageId(reference);
  if (!passageId) return null;

  const apiBase = getYouVersionConfig().apiBase;
  const tryOrder = [
    preferredTranslation,
    ...KID_TRANSLATION_TRY_ORDER.filter((t) => t !== preferredTranslation),
  ];

  for (const translation of tryOrder) {
    const bibleId = BIBLE_IDS[translation];
    if (!bibleId) continue;

    const url = `${apiBase}/bibles/${bibleId}/passages/${passageId}?format=text`;
    try {
      const res = await fetch(url, {
        headers: buildHeaders(appKey),
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        console.warn(`YouVersion ${translation} (${bibleId}) ${res.status} for ${passageId}`);
        continue;
      }

      const data = await res.json();
      const text = stripHtml(data.content || data.text || "");
      if (!text) continue;

      return normalizePassageResponse(data, reference, translation);
    } catch (err) {
      console.warn(`YouVersion fetch error (${translation}):`, err.message);
    }
  }

  return null;
}

/** Day of year 1–366 for Verse of the Day calendar. */
export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.min(366, Math.max(1, Math.floor(diff / oneDay)));
}

/**
 * YouVersion Verse of the Day: calendar passage + kid-friendly translation.
 */
export async function fetchVerseOfDay(preferredTranslation = "ICB") {
  const appKey = getYouVersionConfig().appKey;
  if (!appKey) return null;

  const apiBase = getYouVersionConfig().apiBase;
  const day = dayOfYear();

  try {
    const votdRes = await fetch(`${apiBase}/verse_of_the_days/${day}`, {
      headers: buildHeaders(appKey),
      next: { revalidate: 3600 },
    });

    if (!votdRes.ok) {
      console.warn(`YouVersion VOTD ${votdRes.status}, using John 3:16`);
      return fetchPassage("John 3:16", preferredTranslation);
    }

    const votd = await votdRes.json();
    const passageId = votd.passage_id;
    if (!passageId) return fetchPassage("John 3:16", preferredTranslation);

    const tryOrder = [
      preferredTranslation,
      ...KID_TRANSLATION_TRY_ORDER.filter((t) => t !== preferredTranslation),
    ];

    for (const translation of tryOrder) {
      const bibleId = BIBLE_IDS[translation];
      if (!bibleId) continue;

      const url = `${apiBase}/bibles/${bibleId}/passages/${passageId}?format=text`;
      const res = await fetch(url, { headers: buildHeaders(appKey), next: { revalidate: 3600 } });
      if (!res.ok) continue;

      const data = await res.json();
      const text = stripHtml(data.content || data.text || "");
      if (!text) continue;

      return {
        ...normalizePassageResponse(data, data.reference || passageId, translation),
        votdDay: day,
        passageId,
      };
    }

    return fetchPassage("John 3:16", preferredTranslation);
  } catch (err) {
    console.warn("YouVersion VOTD error:", err.message);
    return fetchPassage("John 3:16", preferredTranslation);
  }
}
