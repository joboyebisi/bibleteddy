const NOTE_SCALE = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25];
const GRID_ICONS = ["music_note", "star", "favorite", "flare", "pets", "wb_sunny", "bolt", "celebration", "audiotrack", "church", "book", "numbers"];

/** Build a 16-slot music grid from verse words for the sing-along page. */
export function buildMusicGridFromVerse(verseText, reference = "") {
  const words = String(verseText || "")
    .replace(/["""'']/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 12);

  const refParts = reference.split(/[\s:]+/).filter(Boolean);
  const tail = refParts.length >= 2 ? refParts.slice(-2) : ["Amen"];

  const slots = [...words];
  while (slots.length < 10) slots.push("♫");
  slots.push(...tail.slice(0, 2), "Amen");

  const grid = slots.slice(0, 16).map((text, index) => ({
    text,
    key: text.replace(/[^\w]/g, "") || `slot-${index}`,
    icon: text === "♫" ? "audiotrack" : GRID_ICONS[index % GRID_ICONS.length],
    freq: NOTE_SCALE[index % NOTE_SCALE.length],
    bg:
      index % 4 === 0
        ? "bg-primary-container/80 text-on-primary-container"
        : index % 4 === 1
          ? "bg-secondary-container/80 text-on-secondary-container"
          : index % 4 === 2
            ? "bg-tertiary-container/80 text-on-tertiary-container"
            : "bg-error-container/80 text-on-error-container",
  }));

  const amenIdx = grid.findIndex((b) => b.text === "Amen");
  if (amenIdx >= 0) {
    grid[amenIdx] = {
      ...grid[amenIdx],
      freq: [261.63, 329.63, 392.0, 523.25],
      bg: "bg-secondary-container/90 border-4 border-white text-on-secondary-container",
    };
  }

  return grid;
}

/** Display words for sing-along highlight row. */
export function buildVerseWordList(verseText) {
  return String(verseText || "")
    .replace(/["""'']/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((text, index) => ({
      text: index < buildVerseWordCount(verseText) - 1 ? `${text} ` : text,
      key: text.replace(/[^\w]/g, "") || `w-${index}`,
    }));
}

function buildVerseWordCount(verseText) {
  return String(verseText || "").split(/\s+/).filter(Boolean).length;
}

/** Playable word sequence (skips decorative tiles). */
export function buildSongSequence(gridButtons) {
  return gridButtons
    .filter((btn) => btn.text !== "♫")
    .map((btn, index) => ({ word: btn.text, key: btn.key, delay: index * 350 }));
}
