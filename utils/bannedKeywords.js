// 🚫 Base banned keyword list
export const bannedKeywords = [
  "porn",
  "sex",
  "nude",
  "naked",
  "xxx",
  "hentai",
  "blowjob",
  "boobs",
  "escort",
  "anal",
  "dildo",
  "erotic",
  "masturbation",
  "nsfw",
  "sex tape",
  "onlyfans",
  "camgirl",
  "murder",
  "kill",
  "shot",
  "suicide",
  "raped",
  "stabbing",
  "bloodbath",
  "bomb",
  "massacre",
  "decapitate",
  "execution",
  "lynching",
  "war crime",
  "torture",
  "cocaine",
  "heroin",
  "meth",
  "weed",
  "marijuana",
  "ecstasy",
  "lsd",
  "drug abuse",
  "overdose",
  "opioids",
  "sniffing",
  "injecting",
  "fuck",
  "shit",
  "bitch",
  "ass",
  "cunt",
  "mf",
  "racist",
  "nigger",
  "slur",
  "hate group",
  "xenophobic",
  "homophobic",
  "transphobic",
  "abortion",
  "aids",
  "std",
  "miscarriage",
  "chemotherapy",
  "terminal illness",
  "self-harm",
  "mental breakdown",
  "euthanasia",
  "scam",
  "fraud",
  "hacking",
  "torrent",
  "piracy",
  "darknet",
  "murder case",
  "kidnapping",
  "smuggling",
  "identity theft",
  "cheat code",
  "hacking tools",
  "terrorist",
  "jihad",
  "radical",
  "isis",
  "hamas",
  "war zone",
  "religious cult",
  "dictator",
  "genocide",
  "revolution",
  "assassination",
  "vodka",
  "whiskey",
  "beer",
  "smoking",
  "vape",
  "tobacco",
  "e-cigarette",
  "casino",
  "poker",
  "lottery",
  "betting",
  "sportsbook",
  "flat earth",
  "9/11 hoax",
  "vaccine microchip",
  "deep state",
  "chemtrails",
  "qanon",
  "illuminati",
  "government cover-up",
  "sugar daddy",
  "dating hookup",
  "sex chat",
  "find partner",
  "free sex",
  "gay hookup",
  "milf",
  "tinder clone",
  "casual dating",
  "revenge",
  "scandal",
  "leaked",
  "exposed",
  "crash victim",
  "cyberbullying",
  "school shooting",
  "assault",
  "pedophile",
  "stalker",
  "died",
  "dead",
  "death",
  "rip",
  "passed away",
  "car crash death",
  "tragic end",
  "last rites",
];

// ⚡ Replace common leetspeak characters for misspellings
const charVariants = {
  a: "[a@4]",
  e: "[e3]",
  i: "[i1!|]",
  o: "[o0]",
  u: "[uüv]",
  s: "[s$5]",
  t: "[t+7]",
  g: "[g9]",
  l: "[l1|]",
  b: "[b8]",
  " ": "[\\s-_]*", // allow hyphens, spaces, underscores
};

// 🔥 Build advanced regex from keywords
export const bannedRegexList = bannedKeywords.map((keyword) => {
  let pattern = "";

  for (let ch of keyword.toLowerCase()) {
    pattern += charVariants[ch] || ch; // Convert characters to variant regex
  }

  return new RegExp(pattern, "i"); // case-insensitive
});

// 🔥 Extra fuzzy detection for common filtered words
export const fuzzyPatterns = [
  /s[\W_]*e[\W_]*x/i, // s_e_x, s3x, sx
  /p[\W_]*o[\W_]*r[\W_]*n/i, // porn, p0rn, pnrn
  /h[\W_]*e[\W_]*n[\W_]*t[\W_]*a[\W_]*i/i, // hentai → h3ntai, hent@i
  /n[\W_]*u[\W_]*d[\W_]*e/i, // nude → nüd3, n_de
];


export function isBlockedQuery(q) {
  if (!q) return false;

  const text = q.toLowerCase();

  // Exact matches with variants
  const exact = bannedRegexList.some((regex) => regex.test(text));

  // Fuzzy symbols/misspellings
  const fuzzy = fuzzyPatterns.some((regex) => regex.test(text));

  return exact || fuzzy;
}
