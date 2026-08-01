import { NextResponse } from "next/server";
import { referenceToPassageId } from "@/lib/youversion/passage";
import { getYouVersionConfig } from "@/lib/youversion/config";

// YouVersion Bible IDs for the translations we use
const BIBLE_IDS = {
  ICB: 1588,
  ESV: 59,
  NIV: 111,
  KJV: 1,
  NLT: 116,
};

function getAppKey() {
  return getYouVersionConfig().appKey;
}

function buildHeaders(appKey) {
  return {
    "X-YVP-App-Key": appKey,
    Accept: "application/json",
    "Accept-Language": "en",
  };
}

/**
 * GET /api/youversion/verse?reference=John+3:16&translation=ICB
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || "John 3:16";
  const translation = searchParams.get("translation") || "ICB";

  const appKey = getAppKey();
  if (!appKey) {
    return NextResponse.json(getFallbackVerse(reference, translation));
  }

  try {
    const bibleId = BIBLE_IDS[translation] || BIBLE_IDS.ICB;
    const passageId = referenceToPassageId(reference);

    if (!passageId) {
      return NextResponse.json(getFallbackVerse(reference, translation));
    }

    const apiBase = getYouVersionConfig().apiBase;
    const url = `${apiBase}/bibles/${bibleId}/passages/${passageId}`;

    const res = await fetch(url, {
      headers: buildHeaders(appKey),
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`YouVersion API ${res.status}: falling back`);
      return NextResponse.json(getFallbackVerse(reference, translation));
    }

    const data = await res.json();
    const text =
      data.content ||
      data.passage?.content ||
      data.text ||
      extractTextFromPassage(data);

    return NextResponse.json({
      reference: data.reference?.human || data.human_reference || reference,
      translation,
      text: stripHtml(text),
      copyright: data.copyright || `YouVersion • ${translation}`,
      source: "youversion",
    });
  } catch (err) {
    console.error("YouVersion API error:", err);
    return NextResponse.json(getFallbackVerse(reference, translation));
  }
}

/**
 * POST /api/youversion/verse
 */
export async function POST(request) {
  const { reference, translation = "ICB" } = await request.json();
  const appKey = getAppKey();

  if (!appKey) {
    return NextResponse.json(getFallbackVerse(reference || "John 3:16", translation));
  }

  try {
    const apiBase = getYouVersionConfig().apiBase;

    if (!reference) {
      const bibleId = BIBLE_IDS.NIV || 111;
      const votdUrl = `${apiBase}/bibles/${bibleId}/passages/JHN.3.16`;
      const res = await fetch(votdUrl, {
        headers: buildHeaders(appKey),
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        const text = stripHtml(data.content || data.text || "");
        return NextResponse.json({
          reference: data.reference?.human || "John 3:16",
          translation: "NIV",
          text,
          source: "youversion",
        });
      }
    }

    const bibleId = BIBLE_IDS[translation] || BIBLE_IDS.ICB;
    const passageId = referenceToPassageId(reference);
    if (!passageId) {
      return NextResponse.json(getFallbackVerse(reference, translation));
    }

    const url = `${apiBase}/bibles/${bibleId}/passages/${passageId}`;
    const res = await fetch(url, { headers: buildHeaders(appKey) });

    if (!res.ok) return NextResponse.json(getFallbackVerse(reference, translation));

    const data = await res.json();
    return NextResponse.json({
      reference: data.reference?.human || reference,
      translation,
      text: stripHtml(data.content || data.text || ""),
      source: "youversion",
    });
  } catch {
    return NextResponse.json(getFallbackVerse(reference, translation));
  }
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTextFromPassage(data) {
  if (data.verses?.length) {
    return data.verses.map((v) => v.text || v.content).join(" ");
  }
  return "";
}

function getFallbackVerse(reference, translation) {
  const fallbacks = {
    "Genesis 1:1": {
      ICB: "In the beginning, God created the sky and the earth.",
      ESV: "In the beginning, God created the heavens and the earth.",
      KJV: "In the beginning God created the heaven and the earth.",
    },
    "John 3:16": {
      ICB: "God loved the world so much that he gave his only Son. God gave his Son so that whoever believes in him may not be lost, but have eternal life.",
      ESV: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
      KJV: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
    },
    "Psalm 23:1": {
      ICB: "The Lord is my shepherd. I have everything I need.",
      ESV: "The LORD is my shepherd; I shall not want.",
      KJV: "The LORD is my shepherd; I shall not want.",
    },
    "Philippians 4:13": {
      ICB: "I can do all things through Christ because he gives me strength.",
      ESV: "I can do all things through him who strengthens me.",
      KJV: "I can do all things through Christ which strengtheneth me.",
    },
    "Isaiah 9:6": {
      ICB: "A child will be born to us. God will give a son to us.",
      ESV: "For to us a child is born, to us a son is given.",
    },
    "Mark 4:41": {
      ICB: "They said to each other, 'Even the wind and the waves obey him!'",
      ESV: "And they said to one another, 'Who then is this, that even wind and sea obey him?'",
    },
    "Psalm 28:7": {
      ICB: "The Lord gives me strength and protects me like a shield.",
      ESV: "The LORD is my strength and my shield; in him my heart trusts.",
    },
    "Matthew 28:6": {
      ICB: "Jesus is not here! He has risen from death, just as he promised!",
      ESV: "He is not here, for he has risen, as he said.",
    },
    "Luke 22:19": {
      ICB: "Jesus took bread, gave thanks, broke it and said: 'Do this to remember me.'",
      ESV: "And he took bread, gave thanks, broke it and gave it to them.",
    },
  };

  const verse = fallbacks[reference];
  const text = verse?.[translation] || verse?.ICB || `"${reference}" — YouVersion`;

  return {
    reference,
    translation,
    text,
    copyright: `YouVersion ${translation} — bible.com`,
    source: "fallback",
  };
}
