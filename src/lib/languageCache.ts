import type { ApiLanguage } from "@/api/models/language.model";
import { gameService } from "@/api/services/game.service";
import { db } from "./db";

const TTL_MS = 4 * 24 * 60 * 60 * 1000; // 4 days — single source of truth

/** In-memory copy so synchronous helpers work without async. */
let mem: ApiLanguage[] | null = null;

async function load(): Promise<ApiLanguage[]> {
  const cached = await db.languageCache.get(1);
  const stale = !cached || Date.now() - cached.fetchedAt > TTL_MS;

  if (!stale && cached.languages.length) {
    mem = cached.languages;
    return cached.languages;
  }

  try {
    const fresh = await gameService.getLanguages();
    await db.languageCache.put({ id: 1, languages: fresh, fetchedAt: Date.now() });
    mem = fresh;
    return fresh;
  } catch {
    // Network failed — use stale data rather than breaking the app
    if (cached?.languages.length) {
      mem = cached.languages;
      return cached.languages;
    }
    return [];
  }
}

/** Call once on app start. Warms the in-memory cache from IndexedDB. */
export async function initLanguageCache(): Promise<void> {
  await load();
}

/** Maps a BCP-47 language code (e.g. "en") → API numeric ID. Returns null if unknown. */
export async function resolveLanguageId(code: string): Promise<number | null> {
  if (!mem) await load();
  return mem?.find((l) => l.code === code)?.id ?? null;
}

/** All languages marked active by the API. Falls back to [] if cache not yet loaded. */
export function getActiveLanguages(): ApiLanguage[] {
  return (mem ?? []).filter((l) => l.isActive === 1);
}

/** True if the language code is RTL per the API. Falls back to a known RTL set. */
export function isRtlLanguage(code: string): boolean {
  if (!mem) return ["ar", "ur", "he", "fa"].includes(code);
  return mem.find((l) => l.code === code)?.direction === "rtl";
}

/** Full BCP-47 locale string (e.g. "ar-SA") for a language code. */
export function getLocaleCode(code: string): string {
  return mem?.find((l) => l.code === code)?.locale ?? code;
}
