/**
 * Checkpoint timing rules — keeps quizzes at meaningful, well-spaced moments.
 */
export const CHECKPOINT_RULES = {
  MIN_GAP_SECONDS: 45,
  MIN_GAP_RATIO: 0.12,
  INTRO_SKIP_RATIO: 0.08,
  OUTRO_SKIP_RATIO: 0.05,
  MIN_CHECKPOINTS: 2,
  MAX_CHECKPOINTS: 5,
  SECONDS_PER_CHECKPOINT: 120,
};

/** Parse MM:SS, HH:MM:SS, plain seconds, or "90s" into seconds. */
export function parseTimestampToSeconds(input) {
  if (typeof input === "number" && Number.isFinite(input)) {
    return Math.max(0, Math.floor(input));
  }
  if (input == null) return null;

  const str = String(input).trim();
  const secMatch = str.match(/^(\d+)\s*s(ec(ond(s)?)?)?$/i);
  if (secMatch) return parseInt(secMatch[1], 10);

  const clockMatch = str.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (clockMatch) {
    const [, a, b, c] = clockMatch;
    if (c) return parseInt(a, 10) * 3600 + parseInt(b, 10) * 60 + parseInt(c, 10);
    return parseInt(a, 10) * 60 + parseInt(b, 10);
  }

  const num = parseInt(str, 10);
  return Number.isFinite(num) ? num : null;
}

/** Parse Gemini keyMoments like "01:05 - Wise men arrive". */
export function parseKeyMoments(keyMoments) {
  if (!Array.isArray(keyMoments)) return [];

  return keyMoments
    .map((moment, index) => {
      if (typeof moment === "object" && moment != null) {
        const timeSeconds =
          parseTimestampToSeconds(moment.timeSeconds ?? moment.timestamp ?? moment.time) ??
          parseTimestampToSeconds(String(moment.label || moment.description || ""));
        return {
          index,
          timeSeconds,
          label: moment.label || moment.description || moment.title || "",
        };
      }

      const str = String(moment);
      const match = str.match(/^(\d{1,2}:\d{2}(?::\d{2})?|\d+)\s*[-–—]?\s*(.*)$/);
      const timeSeconds = parseTimestampToSeconds(match?.[1] || str);
      return {
        index,
        timeSeconds,
        label: (match?.[2] || str).trim(),
      };
    })
    .filter((m) => m.timeSeconds != null)
    .sort((a, b) => a.timeSeconds - b.timeSeconds);
}

export function computeIdealCheckpointCount(durationSeconds) {
  const duration = Math.max(durationSeconds || 180, 60);
  const byDuration = Math.round(duration / CHECKPOINT_RULES.SECONDS_PER_CHECKPOINT);
  return Math.min(
    CHECKPOINT_RULES.MAX_CHECKPOINTS,
    Math.max(CHECKPOINT_RULES.MIN_CHECKPOINTS, byDuration)
  );
}

/** Evenly spaced timestamps inside the playable window. */
export function computeIdealTimestamps(durationSeconds, count) {
  const duration = Math.max(durationSeconds || 180, 60);
  const start = Math.floor(duration * CHECKPOINT_RULES.INTRO_SKIP_RATIO);
  const end = Math.floor(duration * (1 - CHECKPOINT_RULES.OUTRO_SKIP_RATIO));
  const span = Math.max(end - start, 30);
  const minGap = Math.max(
    CHECKPOINT_RULES.MIN_GAP_SECONDS,
    Math.floor(duration * CHECKPOINT_RULES.MIN_GAP_RATIO)
  );

  if (count <= 1) return [Math.min(start + Math.floor(span / 2), end)];

  const raw = [];
  for (let i = 1; i <= count; i++) {
    raw.push(Math.floor(start + (span * i) / (count + 1)));
  }

  const spaced = [raw[0]];
  for (let i = 1; i < raw.length; i++) {
    spaced.push(Math.min(Math.max(raw[i], spaced[i - 1] + minGap), end));
  }
  return spaced;
}

/** Resolve a checkpoint's trigger time from seconds or percent of duration. */
export function resolveCheckpointTime(checkpoint, durationSeconds) {
  if (!checkpoint) return null;
  const duration = Math.max(durationSeconds || 180, 60);

  if (checkpoint.timeSeconds != null) {
    const sec = parseTimestampToSeconds(checkpoint.timeSeconds);
    if (sec != null) return sec;
  }

  if (checkpoint.timePercent != null) {
    const pct = Number(checkpoint.timePercent);
    if (Number.isFinite(pct)) {
      return Math.floor(duration * Math.min(Math.max(pct, 0), 100) / 100);
    }
  }

  return null;
}

/** Apply bounds + minimum spacing between checkpoints. */
function enforceSpacing(checkpoints, durationSeconds) {
  const duration = Math.max(durationSeconds || 180, 60);
  const start = Math.floor(duration * CHECKPOINT_RULES.INTRO_SKIP_RATIO);
  const end = Math.floor(duration * (1 - CHECKPOINT_RULES.OUTRO_SKIP_RATIO));
  const minGap = Math.max(
    CHECKPOINT_RULES.MIN_GAP_SECONDS,
    Math.floor(duration * CHECKPOINT_RULES.MIN_GAP_RATIO)
  );

  const sorted = [...checkpoints].sort((a, b) => a.timeSeconds - b.timeSeconds);
  if (sorted.length === 0) return sorted;

  sorted[0].timeSeconds = Math.min(Math.max(sorted[0].timeSeconds, start), end);

  for (let i = 1; i < sorted.length; i++) {
    sorted[i].timeSeconds = Math.min(
      Math.max(sorted[i].timeSeconds, sorted[i - 1].timeSeconds + minGap),
      end
    );
  }

  return sorted;
}

/**
 * Normalize AI-generated checkpoints onto meaningful, well-separated timestamps.
 * Uses video duration + optional Gemini keyMoments when available.
 */
export function normalizeCheckpoints(rawCheckpoints, durationSeconds, options = {}) {
  const { keyMoments = [], maxCount } = options;
  const duration = Math.max(durationSeconds || 180, 60);
  const targetCount = maxCount || computeIdealCheckpointCount(duration);
  const idealTimes = computeIdealTimestamps(duration, targetCount);
  const parsedMoments = parseKeyMoments(keyMoments);

  let checkpoints = (rawCheckpoints || []).map((cp, index) => {
    const resolved =
      resolveCheckpointTime(cp, duration) ??
      parsedMoments[index]?.timeSeconds ??
      idealTimes[index] ??
      idealTimes[idealTimes.length - 1];

    return {
      ...cp,
      id: cp.id || `cp-${index + 1}`,
      timeSeconds: resolved,
      title: cp.title || parsedMoments[index]?.label?.slice(0, 80) || `Story Moment ${index + 1}`,
    };
  });

  if (checkpoints.length === 0 && parsedMoments.length > 0) {
    checkpoints = parsedMoments.slice(0, targetCount).map((moment, index) => ({
      id: `cp-moment-${index + 1}`,
      timeSeconds: moment.timeSeconds,
      title: moment.label || `Story Moment ${index + 1}`,
      question: {
        prompt: `What happened during: ${moment.label || "this part of the story"}?`,
        options: ["God was at work!", "Nothing important", "Everyone gave up", "They ran away"],
        correctAnswer: "God was at work!",
        explanation: "Every moment in God's story teaches us about His love and power.",
      },
    }));
  }

  if (checkpoints.length > targetCount) {
    const pick = [];
    for (let i = 0; i < targetCount; i++) {
      pick.push(Math.round((i / Math.max(targetCount - 1, 1)) * (checkpoints.length - 1)));
    }
    checkpoints = [...new Set(pick)].sort((a, b) => a - b).map((i) => checkpoints[i]);
  }

  while (checkpoints.length < targetCount) {
    const index = checkpoints.length;
    checkpoints.push({
      id: `cp-${index + 1}`,
      timeSeconds: idealTimes[index] ?? idealTimes[idealTimes.length - 1],
      title: `Story Moment ${index + 1}`,
      verseSnippet: "",
      question: {
        prompt: "What is God teaching us in this story?",
        options: [
          "Trust God and follow Him",
          "Ignore what happened",
          "Only think about ourselves",
          "Give up when things are hard",
        ],
        correctAnswer: "Trust God and follow Him",
        explanation: "God's stories help us grow in faith every day!",
      },
    });
  }

  checkpoints = enforceSpacing(checkpoints, duration);

  const stillClustered = checkpoints.some(
    (cp, i) => i > 0 && cp.timeSeconds - checkpoints[i - 1].timeSeconds < CHECKPOINT_RULES.MIN_GAP_SECONDS
  );
  if (stillClustered) {
    checkpoints = checkpoints.map((cp, index) => ({
      ...cp,
      timeSeconds: idealTimes[index] ?? cp.timeSeconds,
    }));
    checkpoints = enforceSpacing(checkpoints, duration);
  }

  return checkpoints.map((cp) => ({
    ...cp,
    timePercent: Math.round((cp.timeSeconds / duration) * 100),
  }));
}

/** Resolve all checkpoint trigger times for playback (percent-aware). */
export function resolveCheckpointsForPlayback(checkpoints, durationSeconds) {
  const duration = Math.max(durationSeconds || 180, 60);
  return normalizeCheckpoints(checkpoints, duration).map((cp) => ({
    ...cp,
    timeSeconds: resolveCheckpointTime(cp, duration) ?? cp.timeSeconds,
  }));
}
