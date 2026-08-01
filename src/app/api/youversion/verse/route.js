import { NextResponse } from "next/server";
import { getYouVersionConfig } from "@/lib/youversion/config";
import { fetchPassage, fetchVerseOfDay } from "@/lib/youversion/fetchPassage";

function getFallbackVerse(reference, translation) {
  const ref = reference || "John 3:16";
  const trans = translation || "ICB";

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
      NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
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

  const verse = fallbacks[ref];
  const text =
    verse?.[trans] ||
    verse?.ICB ||
    verse?.NIV ||
    fallbacks["John 3:16"].ICB;

  return {
    reference: ref,
    translation: trans,
    text,
    copyright: `YouVersion ${trans} — bible.com`,
    source: "fallback",
  };
}

/**
 * GET /api/youversion/verse?reference=John+3:16&translation=ICB
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || "John 3:16";
  const translation = searchParams.get("translation") || "ICB";

  if (!getYouVersionConfig().appKey) {
    return NextResponse.json(getFallbackVerse(reference, translation));
  }

  const live = await fetchPassage(reference, translation);
  if (live?.text) {
    return NextResponse.json(live);
  }

  console.warn(`YouVersion API: falling back for ${reference}`);
  return NextResponse.json(getFallbackVerse(reference, translation));
}

/**
 * POST /api/youversion/verse — Verse of the Day (kid-friendly ICB when licensed)
 */
export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { reference, translation = "ICB" } = body;

  if (!getYouVersionConfig().appKey) {
    return NextResponse.json(
      reference
        ? getFallbackVerse(reference, translation)
        : getFallbackVerse("John 3:16", "ICB")
    );
  }

  if (reference) {
    const live = await fetchPassage(reference, translation);
    if (live?.text) return NextResponse.json(live);
    return NextResponse.json(getFallbackVerse(reference, translation));
  }

  const votd = await fetchVerseOfDay("ICB");
  if (votd?.text) {
    return NextResponse.json(votd);
  }

  console.warn("YouVersion VOTD: falling back to John 3:16 ICB");
  return NextResponse.json(getFallbackVerse("John 3:16", "ICB"));
}
