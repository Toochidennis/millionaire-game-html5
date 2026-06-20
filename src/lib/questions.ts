import type { Question } from "@/types";
import { db } from "./db";
import { gameService, type ApiQuestion } from "@/api/services/game.service";
import { resolveLanguageId } from "./languageCache";

const QUESTION_TTL = 4 * 24 * 60 * 60 * 1000; // 4 days

const SEED_QUESTIONS: Question[] = [
  { id: "q1", category: "science",       difficulty: "easy",   prompt: "What gas do plants primarily absorb for photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct: 1,
    explanation: "Plants take in CO₂ and release O₂ as a by-product of photosynthesis.", globalAccuracy: 0.86 },
  { id: "q2", category: "geography",     difficulty: "easy",   prompt: "Which country has the most natural lakes?",
    options: ["Russia", "Canada", "USA", "Finland"], correct: 1,
    explanation: "Canada holds roughly 60% of the world's lakes — over two million.", globalAccuracy: 0.41 },
  { id: "q3", category: "tech",          difficulty: "medium", prompt: "What does the 'S' in HTTPS stand for?",
    options: ["Speed", "Secure", "System", "Session"], correct: 1,
    explanation: "HTTPS = HTTP Secure, encrypting traffic via TLS.", globalAccuracy: 0.72 },
  { id: "q4", category: "history",       difficulty: "medium", prompt: "The Rosetta Stone helped decode which writing system?",
    options: ["Cuneiform", "Hieroglyphics", "Linear B", "Runes"], correct: 1,
    explanation: "Its parallel Greek text unlocked Egyptian hieroglyphs.", globalAccuracy: 0.58 },
  { id: "q5", category: "nature",        difficulty: "hard",   prompt: "Which animal has the highest blood pressure?",
    options: ["Elephant", "Giraffe", "Blue whale", "Cheetah"], correct: 1,
    explanation: "A giraffe's heart pumps blood ~2m up to the brain.", globalAccuracy: 0.33 },
  { id: "q6", category: "art",           difficulty: "expert", prompt: "Who painted 'The Garden of Earthly Delights'?",
    options: ["Bruegel", "Bosch", "Dürer", "Van Eyck"], correct: 1,
    explanation: "Hieronymus Bosch, c. 1490–1510, a triptych in the Prado.", globalAccuracy: 0.27 },
  { id: "q7", category: "sports",        difficulty: "easy",   prompt: "How many players are on a standard soccer team on the field?",
    options: ["9", "10", "11", "12"], correct: 2,
    explanation: "Eleven per side, including the goalkeeper.", globalAccuracy: 0.91 },
  { id: "q8", category: "entertainment", difficulty: "medium", prompt: "Which studio created the film 'Spirited Away'?",
    options: ["Pixar", "Studio Ghibli", "DreamWorks", "Laika"], correct: 1,
    explanation: "Studio Ghibli, directed by Hayao Miyazaki (2001).", globalAccuracy: 0.64 },
];

function levelToDifficulty(level: number): Question["difficulty"] {
  if (level <= 1) return "easy";
  if (level === 2) return "medium";
  if (level === 3) return "hard";
  return "expert";
}

function transformQuestion(q: ApiQuestion, level: number): Question {
  return {
    id: String(q.id),
    category: "general" as Question["category"],
    difficulty: levelToDifficulty(level),
    level,
    prompt: q.questionText,
    options: [
      q.options[0]?.text ?? "",
      q.options[1]?.text ?? "",
      q.options[2]?.text ?? "",
      q.options[3]?.text ?? "",
    ] as [string, string, string, string],
    correct: (q.correct.order ?? 0) as 0 | 1 | 2 | 3,
    explanation: q.explanation,
    globalAccuracy: 0.5,
  };
}

// Randomises A/B/C/D order and updates the correct index to match.
function shuffleOptions(q: Question): Question {
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const options = order.map((i) => q.options[i]) as [string, string, string, string];
  const correct = order.indexOf(q.correct) as 0 | 1 | 2 | 3;
  return { ...q, options, correct };
}

export async function loadQuestionBank(languageCode = "en"): Promise<Question[]> {
  const languageId = await resolveLanguageId(languageCode);
  if (languageId != null) {
    const cached = await db.questionBanks.get(languageId);
    const stale = !cached || Date.now() - cached.fetchedAt > QUESTION_TTL;
    if (!stale && cached.questions.length > 0) return cached.questions;
    try {
      const data = await gameService.getQuestions(languageId);
      const questions = data.levels.flatMap((lvl) =>
        lvl.questions.map((q) => transformQuestion(q, lvl.level))
      );
      await db.questionBanks.put({ languageId, questions, fetchedAt: Date.now() });
      return questions;
    } catch {
      if (cached?.questions.length) return cached.questions;
    }
  }
  return SEED_QUESTIONS;
}

// Load the set of question IDs already seen by this player in this language.
export async function loadSeenIds(langCode: string): Promise<Set<string>> {
  const row = await db.seenQuestions.get(langCode);
  return new Set(row?.ids ?? []);
}

// After a completed game, persist the played question IDs.
export async function markSeen(langCode: string, ids: string[]): Promise<void> {
  const row = await db.seenQuestions.get(langCode);
  // Merge and deduplicate
  const merged = [...new Set([...(row?.ids ?? []), ...ids])];
  await db.seenQuestions.put({ langCode, ids: merged });
}

// Derives total level count from the question bank returned by the API.
export function getTotalLevels(bank: Question[]): number {
  if (!bank.length) return 15;
  return Math.max(...bank.map((q) => q.level ?? 1));
}

// Build a 15-question match. Excludes seen IDs; auto-resets a rung's pool when exhausted.
// Shuffles A/B/C/D order on every question so answers never appear in the same slots.
export function buildMatch(
  bank: Question[],
  count = 15,
  seenIds: Set<string> = new Set(),
): Question[] {
  const pick = (pool: Question[]) => pool[Math.floor(Math.random() * pool.length)];
  const out: Question[] = [];

  for (let i = 0; i < count; i++) {
    const targetLevel = i + 1;
    const allAtLevel  = bank.filter((q) => q.level === targetLevel);
    const freshAtLevel = allAtLevel.filter((q) => !seenIds.has(q.id));
    // If all questions at this rung have been seen, cycle through again
    const pool = freshAtLevel.length ? freshAtLevel : allAtLevel;
    const source = pool.length ? pool : bank;
    out.push(shuffleOptions(pick(source)));
  }

  return out;
}
