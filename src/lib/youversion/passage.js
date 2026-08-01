/**
 * Convert human-readable references (e.g. "John 3:16") to YouVersion passage IDs (e.g. "JHN.3.16")
 */
const BOOK_ABBR = {
  genesis: "GEN", gen: "GEN",
  exodus: "EXO", exo: "EXO",
  leviticus: "LEV", lev: "LEV",
  numbers: "NUM", num: "NUM",
  deuteronomy: "DEU", deut: "DEU",
  joshua: "JOS", jos: "JOS",
  judges: "JDG", jdg: "JDG",
  ruth: "RUT", rut: "RUT",
  "1 samuel": "1SA", "1samuel": "1SA", "1 sam": "1SA",
  "2 samuel": "2SA", "2samuel": "2SA", "2 sam": "2SA",
  "1 kings": "1KI", "1kings": "1KI",
  "2 kings": "2KI", "2kings": "2KI",
  "1 chronicles": "1CH", "2 chronicles": "2CH",
  ezra: "EZR", nehemiah: "NEH", esther: "EST",
  job: "JOB",
  psalm: "PSA", psalms: "PSA", ps: "PSA",
  proverbs: "PRO", prov: "PRO",
  ecclesiastes: "ECC", eccl: "ECC",
  "song of solomon": "SNG", song: "SNG",
  isaiah: "ISA", isa: "ISA",
  jeremiah: "JER", jer: "JER",
  lamentations: "LAM",
  ezekiel: "EZK", ezek: "EZK",
  daniel: "DAN", dan: "DAN",
  hosea: "HOS", joel: "JOL", amos: "AMO",
  obadiah: "OBA", jonah: "JON", micah: "MIC",
  nahum: "NAM", habakkuk: "HAB", zephaniah: "ZEP",
  haggai: "HAG", zechariah: "ZEC", malachi: "MAL",
  matthew: "MAT", matt: "MAT", mat: "MAT",
  mark: "MRK", mrk: "MRK",
  luke: "LUK", luk: "LUK",
  john: "JHN", jhn: "JHN",
  acts: "ACT",
  romans: "ROM", rom: "ROM",
  "1 corinthians": "1CO", "1corinthians": "1CO",
  "2 corinthians": "2CO", "2corinthians": "2CO",
  galatians: "GAL", gal: "GAL",
  ephesians: "EPH", eph: "EPH",
  philippians: "PHP", phil: "PHP",
  colossians: "COL", col: "COL",
  "1 thessalonians": "1TH", "2 thessalonians": "2TH",
  "1 timothy": "1TI", "2 timothy": "2TI",
  titus: "TIT", philemon: "PHM",
  hebrews: "HEB", heb: "HEB",
  james: "JAS", jas: "JAS",
  "1 peter": "1PE", "2 peter": "2PE",
  "1 john": "1JN", "2 john": "2JN", "3 john": "3JN",
  jude: "JUD",
  revelation: "REV", rev: "REV",
};

export function referenceToPassageId(reference) {
  if (!reference) return null;

  const normalized = reference.trim().replace(/\s+/g, " ");
  const match = normalized.match(/^(.+?)\s+(\d+)(?::(\d+(?:-\d+)?))?$/i);
  if (!match) return null;

  const bookKey = match[1].toLowerCase().replace(/\./g, "");
  const chapter = match[2];
  const verse = match[3] || "1";
  const abbr = BOOK_ABBR[bookKey];
  if (!abbr) return null;

  return `${abbr}.${chapter}.${verse.split("-")[0]}`;
}
