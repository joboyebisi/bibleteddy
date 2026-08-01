/**
 * Memory verse tied to the kid's current adventure story — fetched live from YouVersion.
 */

export function storyToMemoryVerse(story) {
  if (!story?.verse) return null;
  return {
    id: `story-${story.id}`,
    storyId: story.id,
    storyTitle: story.title,
    reference: story.verse,
    translation: "ICB",
    fallbackText: story.translationKids || story.translationClassic || "",
    hint: story.desc
      ? `From ${story.title.replace(/^Superbook:\s*/i, "")}: ${story.desc}`
      : `Learn the scripture from ${story.title}!`,
  };
}

export function pickMemoryStory(stories, preferredId) {
  if (!stories?.length) return null;
  if (preferredId) {
    const found = stories.find((s) => s.id === preferredId);
    if (found && !found.locked) return found;
  }
  return stories.find((s) => !s.locked) || stories[0];
}

export async function fetchStoryVerseFromYouVersion(story, translation = "ICB") {
  const meta = storyToMemoryVerse(story);
  if (!meta) return { text: "", source: "", reference: "", translation };

  try {
    const res = await fetch(
      `/api/youversion/verse?reference=${encodeURIComponent(meta.reference)}&translation=${translation}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.text) {
        return {
          text: data.text,
          source: data.source || "youversion",
          reference: meta.reference,
          translation: data.translation || translation,
          storyTitle: meta.storyTitle,
          hint: meta.hint,
        };
      }
    }
  } catch {
    /* fall through */
  }

  return {
    text: meta.fallbackText,
    source: "fallback",
    reference: meta.reference,
    translation,
    storyTitle: meta.storyTitle,
    hint: meta.hint,
  };
}
