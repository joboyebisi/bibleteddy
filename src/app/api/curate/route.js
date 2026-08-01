import { NextResponse } from "next/server";

/**
 * POST /api/curate
 * Video2App Engine: Parses a YouTube video URL to extract its topic using Gemini,
 * then generates AI quiz checkpoints using Gloo AI Studio (with Gemini fallback).
 *
 * Body: { youtubeUrl: string, topic?: string }
 */
export async function POST(request) {
  const body = await request.json();
  const youtubeUrl = body.youtubeUrl || body.url;
  const manualTopic = body.topic || "";

  if (!youtubeUrl && !manualTopic) {
    return NextResponse.json({ error: "youtubeUrl or topic required" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const glooKey = process.env.GLOO_API_KEY;

  // Extract YouTube ID
  const youtubeId = extractYouTubeId(youtubeUrl || "");

  // Step 1: Use Gemini to extract topic/title from the YouTube URL
  let topic = manualTopic;
  let storyTitle = manualTopic || "Bible Story";
  let extractedVerse = "";

  if (geminiKey && youtubeId) {
    try {
      const extractRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are analyzing a children's Bible animation video from YouTube.
Video ID: "${youtubeId}"
Video URL: "${youtubeUrl || ""}"
${manualTopic ? `Provided topic hint: "${manualTopic}"` : ""}

Based on the URL and video ID, identify the Bible story being told.
Known Superbook episode IDs:
- 8m9gSjV6o2Y = The First Christmas (Luke 2, Isaiah 9:6)
- l54IvPzqXJM = Miracles of Jesus (Mark 4:41, John 6:1-14)
- 0o8NQBuneJM = The Last Supper (Luke 22:19)
- J2Xod4D5UwQ = He Is Risen! (Matthew 28:6)
- RG9_g772vK0 = David and Goliath (1 Samuel 17, Psalm 28:7)

Return ONLY this JSON:
{
  "storyTitle": "Superbook: The First Christmas",
  "topic": "Birth of Jesus in Bethlehem",
  "mainScripture": "Isaiah 9:6",
  "verseText": "For to us a child is born, to us a son is given.",
  "badge": "Love",
  "era": "Gospels",
  "ageRecommendation": "all"
}`
              }]
            }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (extractRes.ok) {
        const extractData = await extractRes.json();
        const extractText = extractData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (extractText) {
          const extracted = JSON.parse(extractText.trim());
          storyTitle = extracted.storyTitle || storyTitle;
          topic = extracted.topic || topic;
          extractedVerse = extracted.mainScripture || "";
        }
      }
    } catch (e) {
      console.warn("Gemini extraction error:", e.message);
    }
  } else if (youtubeId) {
    // URL-based fallback matching
    const match = getStaticMatch(youtubeId, youtubeUrl, manualTopic);
    storyTitle = match.storyTitle;
    topic = match.topic;
    extractedVerse = match.verse;
  }

  // Step 2: Generate quiz checkpoints via Gloo (or Gemini fallback)
  try {
    const quizRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/gloo/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, verseRef: extractedVerse, storyTitle })
    });

    const quizData = await quizRes.json();

    return NextResponse.json({
      story: {
        id: youtubeId || ("custom_" + Date.now()),
        title: storyTitle,
        desc: `An interactive Scripture journey through: ${topic}`,
        youtubeId,
        thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null,
        verse: extractedVerse,
        checkpoints: quizData.checkpoints || [],
        source: quizData.source
      }
    });
  } catch (err) {
    console.error("Curate route error:", err);
    return NextResponse.json({
      story: {
        id: youtubeId || "custom",
        title: storyTitle,
        desc: topic,
        youtubeId,
        thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null,
        verse: extractedVerse,
        checkpoints: []
      }
    });
  }
}

function extractYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
    /youtube\.com\/shorts\/([^&?\s]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getStaticMatch(youtubeId, url, topic) {
  const urlLower = (url + " " + topic).toLowerCase();

  if (youtubeId === "8m9gSjV6o2Y" || urlLower.includes("christmas")) {
    return { storyTitle: "Superbook: The First Christmas", topic: "Birth of Jesus", verse: "Isaiah 9:6" };
  }
  if (youtubeId === "l54IvPzqXJM" || urlLower.includes("miracles")) {
    return { storyTitle: "Superbook: Miracles of Jesus", topic: "Jesus calms the storm and feeds 5000", verse: "Mark 4:41" };
  }
  if (youtubeId === "0o8NQBuneJM" || urlLower.includes("supper")) {
    return { storyTitle: "Superbook: The Last Supper", topic: "Jesus washes feet and institutes communion", verse: "Luke 22:19" };
  }
  if (youtubeId === "J2Xod4D5UwQ" || urlLower.includes("risen")) {
    return { storyTitle: "Superbook: He Is Risen!", topic: "Resurrection of Jesus Christ", verse: "Matthew 28:6" };
  }
  if (youtubeId === "RG9_g772vK0" || urlLower.includes("david") || urlLower.includes("goliath")) {
    return { storyTitle: "Superbook: David and Goliath", topic: "David defeats Goliath with faith", verse: "Psalm 28:7" };
  }
  if (urlLower.includes("creation") || urlLower.includes("beginning")) {
    return { storyTitle: "Superbook: In The Beginning", topic: "God creates the world", verse: "Genesis 1:1" };
  }

  return { storyTitle: topic || "Bible Story", topic: topic || "Faith and courage", verse: "John 3:16" };
}
