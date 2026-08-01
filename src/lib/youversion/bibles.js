/** YouVersion Platform Bible version IDs (see /v1/bibles). */
export const BIBLE_IDS = {
  ICB: 135,
  NIV: 111,
  ESV: 59,
  BSB: 3034,
  KJV: 1,
  NLT: 116,
};

/** Kid-friendly translations to try when one returns 403 (license scope). */
export const KID_TRANSLATION_TRY_ORDER = ["ICB", "NIV", "BSB", "NLT"];
