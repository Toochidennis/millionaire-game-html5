import type { Question } from "@/types";
import { cache } from "./storage";

/** Seed bank shipped with the app so the first session works fully offline. */
export const SEED_QUESTIONS: Question[] = [
  { id: "q1", category: "science", difficulty: "easy", prompt: "What gas do plants primarily absorb for photosynthesis?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct: 1,
    explanation: "Plants take in CO\u2082 and release O\u2082 as a by-product of photosynthesis.", globalAccuracy: 0.86 },
  { id: "q2", category: "geography", difficulty: "easy", prompt: "Which country has the most natural lakes?",
    options: ["Russia", "Canada", "USA", "Finland"], correct: 1,
    explanation: "Canada holds roughly 60% of the world's lakes \u2014 over two million.", globalAccuracy: 0.41 },
  { id: "q3", category: "tech", difficulty: "medium", prompt: "What does the 'S' in HTTPS stand for?",
    options: ["Speed", "Secure", "System", "Session"], correct: 1,
    explanation: "HTTPS = HTTP Secure, encrypting traffic via TLS.", globalAccuracy: 0.72 },
  { id: "q4", category: "history", difficulty: "medium", prompt: "The Rosetta Stone helped decode which writing system?",
    options: ["Cuneiform", "Hieroglyphics", "Linear B", "Runes"], correct: 1,
    explanation: "Its parallel Greek text unlocked Egyptian hieroglyphs.", globalAccuracy: 0.58 },
  { id: "q5", category: "nature", difficulty: "hard", prompt: "Which animal has the highest blood pressure?",
    options: ["Elephant", "Giraffe", "Blue whale", "Cheetah"], correct: 1,
    explanation: "A giraffe's heart pumps blood ~2m up to the brain.", globalAccuracy: 0.33 },
  { id: "q6", category: "art", difficulty: "expert", prompt: "Who painted 'The Garden of Earthly Delights'?",
    options: ["Bruegel", "Bosch", "D\u00fcrer", "Van Eyck"], correct: 1,
    explanation: "Hieronymus Bosch, c. 1490\u20131510, a triptych in the Prado.", globalAccuracy: 0.27 },
  { id: "q7", category: "sports", difficulty: "easy", prompt: "How many players are on a standard soccer team on the field?",
    options: ["9", "10", "11", "12"], correct: 2,
    explanation: "Eleven per side, including the goalkeeper.", globalAccuracy: 0.91 },
  { id: "q8", category: "entertainment", difficulty: "medium", prompt: "Which studio created the film 'Spirited Away'?",
    options: ["Pixar", "Studio Ghibli", "DreamWorks", "Laika"], correct: 1,
    explanation: "Studio Ghibli, directed by Hayao Miyazaki (2001).", globalAccuracy: 0.64 },
];

const KEY = "qbank:v1";

export async function loadQuestionBank(): Promise<Question[]> {
  const cached = await cache.get<Question[]>(KEY);
  if (cached?.length) return cached;
  await cache.set(KEY, SEED_QUESTIONS);
  return SEED_QUESTIONS;
}

/** Difficulty-scaled match builder (dynamic difficulty). */
export function buildMatch(bank: Question[], count = 15): Question[] {
  const order: Question["difficulty"][] = ["easy", "medium", "hard", "expert"];
  const byDiff = (d: string) => bank.filter((q) => q.difficulty === d);
  const out: Question[] = [];
  for (let i = 0; i < count; i++) {
    const tier = order[Math.min(order.length - 1, Math.floor((i / count) * order.length))];
    const pool = byDiff(tier).length ? byDiff(tier) : bank;
    out.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return out;
}
