import { NextResponse } from "next/server";

/**
 * POST /api/gloo/voice-match
 * Uses Gloo AI Studio to verify if a child's spoken verse matches the target verse.
 * This is the "Voice Matching" mechanic for the Voice Verse Reciter feature.
 *
 * Body: { spokenText: string, targetVerse: string, verseReference: string }
 */
export async function POST(request) {
  const { spokenText, targetVerse, verseReference } = await request.json();

  if (!spokenText || !targetVerse) {
    return NextResponse.json({ error: "spokenText and targetVerse required" }, { status: 400 });
  }

  const glooKey = process.env.GLOO_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // --- Try Gloo AI first (faith-tuned, context-aware matching) ---
  if (glooKey) {
    try {
      const res = await fetch(`${process.env.GLOO_API_BASE || "https://api.studio.gloo.us/v1"}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${glooKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gloo-faith-tuned-v1",
          messages: [
            {
              role: "system",
              content: "You are a kind children's Bible teacher evaluating scripture recitation. Be encouraging and gracious. Consider the meaning, not just exact word matching. Respond ONLY with valid JSON."
            },
            {
              role: "user",
              content: `A child tried to recite ${verseReference}.

TARGET VERSE: "${targetVerse}"
CHILD SAID: "${spokenText}"

Evaluate the recitation. Consider: key words matched, meaning preserved, effort shown.
Return ONLY this JSON:
{
  "accuracyPercent": 85,
  "passed": true,
  "keyWordsMissed": ["word1"],
  "teddyFeedback": "Encouraging message from Bible Teddy mascot (1-2 sentences, with emoji)",
  "improvementHint": "Gentle hint about what to work on next time"
}`
            }
          ],
          temperature: 0.5,
          max_tokens: 256,
          response_format: { type: "json_object" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const result = JSON.parse(content);
          return NextResponse.json({ ...result, source: "gloo" });
        }
      }
    } catch (err) {
      console.warn("Gloo voice-match error, falling back:", err.message);
    }
  }

  // --- Fallback: Gemini for voice matching ---
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `A child tried to recite "${verseReference}".
TARGET: "${targetVerse}"
SPOKEN: "${spokenText}"

Score the recitation. Be encouraging. Return ONLY this JSON:
{
  "accuracyPercent": 80,
  "passed": true,
  "keyWordsMissed": [],
  "teddyFeedback": "Encouraging message from Bible Teddy with emoji",
  "improvementHint": "Gentle hint"
}`
              }]
            }],
            generationConfig: { responseMimeType: "application/json" }
          })
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const result = JSON.parse(text.trim());
          return NextResponse.json({ ...result, source: "gemini" });
        }
      }
    } catch (err) {
      console.warn("Gemini voice match error:", err.message);
    }
  }

  // --- Local scoring fallback ---
  const spoken = spokenText.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const target = targetVerse.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const spokenWords = new Set(spoken.split(" ").filter(w => w.length > 2));
  const targetWords = target.split(" ").filter(w => w.length > 2);
  const matched = targetWords.filter(w => spokenWords.has(w)).length;
  const accuracy = Math.round((matched / Math.max(targetWords.length, 1)) * 100);
  const passed = accuracy >= 60;

  return NextResponse.json({
    accuracyPercent: accuracy,
    passed,
    keyWordsMissed: targetWords.filter(w => !spokenWords.has(w)).slice(0, 3),
    teddyFeedback: passed
      ? `Amazing work! 🌟 You spoke God's Word out loud and it counts! Keep shining!`
      : `Great try! 🧸 Practice makes perfect — God loves your effort! Try again!`,
    improvementHint: passed
      ? "Try saying it a little slower next time for even better accuracy!"
      : "Focus on the key words — read the verse a few more times, then try again!",
    source: "local"
  });
}
