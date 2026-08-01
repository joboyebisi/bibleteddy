import { NextResponse } from "next/server";
import { glooChatCompletion, isGlooConfigured } from "@/lib/gloo/client";
import { normalizeCheckpoints, computeIdealCheckpointCount } from "@/lib/checkpoints";

/**
 * POST /api/gloo/quiz
 * Gloo AI Studio (faith-grounded) quiz generation; Gemini fallback.
 */
export async function POST(request) {
  const {
    topic,
    verseRef,
    storyTitle,
    ageGroup = "kids",
    videoSummary,
    durationSeconds = 600,
    keyMoments = [],
  } = await request.json();

  if (!topic && !storyTitle) {
    return NextResponse.json({ error: "topic or storyTitle required" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const checkpointCount = computeIdealCheckpointCount(durationSeconds);
  const prompt = buildQuizPrompt({
    topic: topic || storyTitle,
    verseRef,
    ageGroup,
    videoSummary,
    durationSeconds,
    keyMoments,
    checkpointCount,
  });

  if (isGlooConfigured()) {
    try {
      const { content, model } = await glooChatCompletion({
        model_family: "google",
        temperature: 0.7,
        max_tokens: 2048,
        system:
          "You are a children's Christian education expert. All responses must be theologically sound, age-appropriate, and grounded in Scripture. Always respond with valid JSON only.",
        messages: [{ role: "user", content: prompt }],
      });

      if (content) {
        const quiz = JSON.parse(content);
        const checkpoints = normalizeCheckpoints(quiz.checkpoints || [], durationSeconds, { keyMoments });
        return NextResponse.json({ ...quiz, checkpoints, source: "gloo", model: model || "google (via Gloo)" });
      }
    } catch (err) {
      console.warn("Gloo AI error, falling back to Gemini:", err.message);
    }
  }

  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const quiz = JSON.parse(text.trim());
          const checkpoints = normalizeCheckpoints(quiz.checkpoints || [], durationSeconds, { keyMoments });
          return NextResponse.json({ ...quiz, checkpoints, source: "gemini", model: "gemini-2.5-flash" });
        }
      }
    } catch (err) {
      console.warn("Gemini fallback error:", err.message);
    }
  }

  const fallback = getStaticFallback(topic || storyTitle, durationSeconds);
  return NextResponse.json(fallback);
}

function buildQuizPrompt({ topic, verseRef, ageGroup, videoSummary, durationSeconds, keyMoments, checkpointCount }) {
  const ageInstruction =
    ageGroup === "little"
      ? "very simple language for ages 3-5, one syllable answers"
      : ageGroup === "teens"
        ? "deeper theological concepts for ages 11-14"
        : "fun, engaging language for ages 6-10";

  const durationMin = Math.round(durationSeconds / 60);
  const summaryBlock = videoSummary
    ? `\nVideo content summary: "${videoSummary}"\nBase each question on a specific scene from this video.`
    : "";

  const momentsBlock = keyMoments?.length
    ? `\nKey video moments (align one checkpoint per moment, in order):\n${keyMoments
        .map((m, i) => {
          if (typeof m === "object") {
            return `${i + 1}. ${m.timestamp || m.time || "??:??"} — ${m.label || m.description || ""}`;
          }
          return `${i + 1}. ${m}`;
        })
        .join("\n")}`
    : "";

  return `Generate exactly ${checkpointCount} interactive Bible quiz checkpoints for a children's video about: "${topic}"${verseRef ? `, scripture reference: ${verseRef}` : ""}.${summaryBlock}${momentsBlock}

The full video is approximately ${durationMin} minutes (${durationSeconds} seconds).

Rules:
- Each checkpoint must match a meaningful story moment AFTER the child has watched that part.
- Use "momentIndex" (0-based) to link each checkpoint to the key moment it belongs to.
- Do NOT cluster checkpoints in the first 2 minutes — spread them across the full video.
- Include "timeSeconds" as your best estimate for when to pause (MM:SS converted to seconds).
- Each question needs exactly 4 options with one clear correctAnswer.

Use ${ageInstruction}.

Return ONLY this JSON structure (no markdown, no extra text):
{
  "checkpoints": [
    {
      "id": "cp-1",
      "momentIndex": 0,
      "timeSeconds": 270,
      "title": "Checkpoint title tied to a scene",
      "verseSnippet": "Short scripture quote",
      "question": {
        "prompt": "Fun question about what just happened?",
        "options": ["Correct biblical answer", "Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
        "correctAnswer": "Correct biblical answer",
        "explanation": "Short encouraging explanation with biblical grounding."
      }
    }
  ]
}`;
}

function getStaticFallback(topic, durationSeconds = 600) {
  const checkpoints = normalizeCheckpoints(
    [
      {
        id: "cp-static-1",
        timePercent: 22,
        title: "Story Opening",
        verseSnippet: "For God so loved the world... (John 3:16)",
        question: {
          prompt: `What is the main lesson in the story about ${topic}?`,
          options: [
            "Trusting God in tough times",
            "Running away from problems",
            "Building a big house",
            "Eating lots of food",
          ],
          correctAnswer: "Trusting God in tough times",
          explanation: "God wants us to trust Him in every situation, just like the heroes in His Word!",
        },
      },
      {
        id: "cp-static-2",
        timePercent: 50,
        title: "Middle Moment",
        verseSnippet: "I can do all things through Christ who strengthens me. (Philippians 4:13)",
        question: {
          prompt: "Who gives us strength when things are hard?",
          options: [
            "Jesus Christ gives us strength!",
            "Our toys and games",
            "A magic potion",
            "Sleeping all day",
          ],
          correctAnswer: "Jesus Christ gives us strength!",
          explanation: "Philippians 4:13 says we can do ALL things through Christ who gives us strength!",
        },
      },
      {
        id: "cp-static-3",
        timePercent: 75,
        title: "Faith Application",
        verseSnippet: "The Lord is my shepherd, I shall not want. (Psalm 23:1)",
        question: {
          prompt: "How can we show God's love to others today?",
          options: [
            "Being kind and sharing with friends",
            "Keeping all toys to ourselves",
            "Ignoring people who need help",
            "Only helping ourselves",
          ],
          correctAnswer: "Being kind and sharing with friends",
          explanation: "Jesus said the greatest commandment is to love God and love others as ourselves!",
        },
      },
    ],
    durationSeconds
  );

  return { source: "static", checkpoints };
}
