import { NextResponse } from "next/server";
import { normalizeCheckpoints } from "@/lib/checkpoints";
import { resolveVideoDuration } from "@/lib/youtube";

/**
 * POST /api/curate
 * Video2App Engine: Uses Gemini video understanding on YouTube URLs,
 * then generates AI quiz checkpoints via Gloo (Gemini fallback).
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
  const youtubeId = extractYouTubeId(youtubeUrl || "");
  const fullYoutubeUrl = youtubeId
    ? `https://www.youtube.com/watch?v=${youtubeId}`
    : youtubeUrl;

  let topic = manualTopic;
  let storyTitle = manualTopic || "Bible Story";
  let extractedVerse = "";
  let videoSummary = "";
  let keyMoments = [];
  let estimatedDurationSeconds = null;

  // Step 1: Gemini video understanding (YouTube URL input)
  if (geminiKey && fullYoutubeUrl) {
    try {
      const extractRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  file_data: {
                    file_uri: fullYoutubeUrl,
                  },
                },
                {
                  text: `You are analyzing a children's Bible animation video from YouTube.
${manualTopic ? `Topic hint: "${manualTopic}"` : ""}

Watch and listen to this video carefully. Extract:
1. The Bible story being told
2. Key scripture references mentioned or implied
3. Main moral/spiritual lesson for children ages 6-10
4. 3-5 timestamp moments (MM:SS) where a quiz should pause the video — spread across the full runtime, not clustered in the first 2 minutes

Known Superbook episodes (use if this matches):
- 8m9gSjV6o2Y = The First Christmas (Luke 2, Isaiah 9:6)
- l54IvPzqXJM = Miracles of Jesus (Mark 4:41)
- 0o8NQBuneJM = The Last Supper (Luke 22:19)
- J2Xod4D5UwQ = He Is Risen! (Matthew 28:6)
- RG9_g772vK0 = David and Goliath (1 Samuel 17)

Return ONLY this JSON:
{
  "storyTitle": "Superbook: The First Christmas",
  "topic": "Birth of Jesus in Bethlehem",
  "mainScripture": "Isaiah 9:6",
  "verseText": "For to us a child is born, to us a son is given.",
  "videoSummary": "2-3 sentence summary of what happens in the video",
  "estimatedDurationSeconds": 1500,
  "keyMoments": [
    { "timestamp": "04:30", "label": "Bethlehem stable scene" },
    { "timestamp": "12:15", "label": "Wise men arrive" },
    { "timestamp": "18:40", "label": "Angels announce good news" }
  ],
  "badge": "Love",
  "era": "Gospels",
  "ageRecommendation": "all"
}`,
                },
              ],
            }],
            generationConfig: { responseMimeType: "application/json" },
          }),
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
          videoSummary = extracted.videoSummary || "";
          keyMoments = extracted.keyMoments || [];
          estimatedDurationSeconds = extracted.estimatedDurationSeconds || null;
        }
      } else {
        const errBody = await extractRes.text();
        console.warn("Gemini video analysis failed:", extractRes.status, errBody.slice(0, 200));
      }
    } catch (e) {
      console.warn("Gemini video extraction error:", e.message);
    }
  }

  // Fallback: URL-based static matching if Gemini unavailable or failed
  if (!topic && youtubeId) {
    const match = getStaticMatch(youtubeId, youtubeUrl, manualTopic);
    storyTitle = match.storyTitle;
    topic = match.topic;
    extractedVerse = match.verse;
  }

  if (!topic) topic = manualTopic || "Faith and courage";

  const durationSeconds = await resolveVideoDuration(youtubeId, estimatedDurationSeconds);

  // Step 2: Generate quiz checkpoints via Gloo (or Gemini fallback)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const quizRes = await fetch(`${baseUrl}/api/gloo/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        verseRef: extractedVerse,
        storyTitle,
        videoSummary,
        durationSeconds,
        keyMoments,
      }),
    });

    const quizData = await quizRes.json();
    const checkpoints = normalizeCheckpoints(quizData.checkpoints || [], durationSeconds, {
      keyMoments,
    });

    return NextResponse.json({
      story: {
        id: youtubeId || `custom_${Date.now()}`,
        title: storyTitle,
        desc: videoSummary || `An interactive Scripture journey through: ${topic}`,
        youtubeId,
        thumbnailUrl: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null,
        verse: extractedVerse,
        durationSeconds,
        checkpoints,
        keyMoments,
        source: quizData.source,
        geminiAnalyzed: !!videoSummary,
      },
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
        checkpoints: [],
      },
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
  const urlLower = `${url} ${topic}`.toLowerCase();

  if (youtubeId === "8m9gSjV6o2Y" || youtubeId === "1fl9laM4ViM" || urlLower.includes("christmas")) {
    return { storyTitle: "Superbook: The First Christmas", topic: "Birth of Jesus", verse: "Isaiah 9:6" };
  }
  if (youtubeId === "l54IvPzqXJM" || youtubeId === "EQXyhM592RU" || urlLower.includes("miracles")) {
    return { storyTitle: "Superbook: Miracles of Jesus", topic: "Jesus calms the storm and feeds 5000", verse: "Mark 4:41" };
  }
  if (youtubeId === "0o8NQBuneJM" || urlLower.includes("supper")) {
    return { storyTitle: "Superbook: The Last Supper", topic: "Jesus washes feet and institutes communion", verse: "Luke 22:19" };
  }
  if (youtubeId === "J2Xod4D5UwQ" || youtubeId === "3F0rt2AiqJY" || urlLower.includes("risen")) {
    return { storyTitle: "Superbook: He Is Risen!", topic: "Resurrection of Jesus Christ", verse: "Matthew 28:6" };
  }
  if (youtubeId === "RG9_g772vK0" || youtubeId === "32_Izk21ktw" || urlLower.includes("david") || urlLower.includes("goliath")) {
    return { storyTitle: "Superbook: David and Goliath", topic: "David defeats Goliath with faith", verse: "Psalm 28:7" };
  }
  if (urlLower.includes("creation") || urlLower.includes("beginning")) {
    return { storyTitle: "Superbook: In The Beginning", topic: "God creates the world", verse: "Genesis 1:1" };
  }

  return { storyTitle: topic || "Bible Story", topic: topic || "Faith and courage", verse: "John 3:16" };
}
