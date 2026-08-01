import { NextResponse } from "next/server";
import { glooChatCompletion, isGlooConfigured } from "@/lib/gloo/client";

/**
 * POST /api/gloo/quiz
 * Gloo AI Studio (faith-grounded) quiz generation; Gemini fallback.
 */
export async function POST(request) {
  const { topic, verseRef, storyTitle, ageGroup = "kids", videoSummary } = await request.json();

  if (!topic && !storyTitle) {
    return NextResponse.json({ error: "topic or storyTitle required" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const prompt = buildQuizPrompt(topic || storyTitle, verseRef, ageGroup, videoSummary);

  if (isGlooConfigured()) {
    try {
      const { content, model } = await glooChatCompletion({
        model_family: "google",
        temperature: 0.7,
        max_tokens: 1024,
        system:
          "You are a children's Christian education expert. All responses must be theologically sound, age-appropriate, and grounded in Scripture. Always respond with valid JSON only.",
        messages: [{ role: "user", content: prompt }],
      });

      if (content) {
        const quiz = JSON.parse(content);
        return NextResponse.json({ ...quiz, source: "gloo", model: model || "google (via Gloo)" });
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
          return NextResponse.json({ ...quiz, source: "gemini", model: "gemini-2.5-flash" });
        }
      }
    } catch (err) {
      console.warn("Gemini fallback error:", err.message);
    }
  }

  return NextResponse.json(getStaticFallback(topic || storyTitle));
}

function buildQuizPrompt(topic, verseRef, ageGroup, videoSummary) {
  const ageInstruction =
    ageGroup === "little"
      ? "very simple language for ages 3-5, one syllable answers"
      : ageGroup === "teens"
        ? "deeper theological concepts for ages 11-14"
        : "fun, engaging language for ages 6-10";

  const summaryBlock = videoSummary
    ? `\nVideo content summary: "${videoSummary}"\nBase questions on specific events from this video.`
    : "";

  return `Generate 3 interactive Bible quiz checkpoints for a children's video about: "${topic}"${verseRef ? `, scripture reference: ${verseRef}` : ""}.${summaryBlock}

Use ${ageInstruction}.

Return ONLY this JSON structure (no markdown, no extra text):
{
  "checkpoints": [
    {
      "id": "cp-1",
      "timeSeconds": 30,
      "title": "Checkpoint title",
      "verseSnippet": "Short scripture quote",
      "question": {
        "prompt": "Fun question about the story?",
        "options": ["Correct biblical answer", "Wrong answer 1", "Wrong answer 2", "Wrong answer 3"],
        "correctAnswer": "Correct biblical answer",
        "explanation": "Short encouraging explanation with biblical grounding."
      }
    },
    {
      "id": "cp-2",
      "timeSeconds": 75,
      "title": "Second checkpoint title",
      "verseSnippet": "Another scripture quote",
      "question": {
        "prompt": "Another engaging question?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "Option A",
        "explanation": "Biblical explanation."
      }
    },
    {
      "id": "cp-3",
      "timeSeconds": 120,
      "title": "Final checkpoint title",
      "verseSnippet": "Closing scripture",
      "question": {
        "prompt": "Final reflection question?",
        "options": ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
        "correctAnswer": "Answer 1",
        "explanation": "Faith application explanation."
      }
    }
  ]
}`;
}

function getStaticFallback(topic) {
  return {
    source: "static",
    checkpoints: [
      {
        id: "cp-static-1",
        timeSeconds: 30,
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
          explanation:
            "God wants us to trust Him in every situation, just like the heroes in His Word!",
        },
      },
      {
        id: "cp-static-2",
        timeSeconds: 75,
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
          explanation:
            "Philippians 4:13 says we can do ALL things through Christ who gives us strength!",
        },
      },
      {
        id: "cp-static-3",
        timeSeconds: 120,
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
          explanation:
            "Jesus said the greatest commandment is to love God and love others as ourselves!",
        },
      },
    ],
  };
}
