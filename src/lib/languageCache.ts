import type { ApiLanguage } from "@/api/models/language.model";
import { gameService } from "@/api/services/game.service";

const CACHE_KEY = "mt-languages-v1";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredCache {
  data: ApiLanguage[];
  timestamp: number;
}

let mem: ApiLanguage[] | null = null;

function fromStorage(): ApiLanguage[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw) as StoredCache;
    if (Date.now() - timestamp > TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

async function fetchAndStore(): Promise<ApiLanguage[]> {
  const list = (await gameService.getLanguages()) as ApiLanguage[];
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, timestamp: Date.now() } satisfies StoredCache));
  mem = list;
  return list;
}

// Pre-populate from localStorage synchronously on module load (if not expired).
const _stored = fromStorage();
if (_stored?.length) mem = _stored;

export async function initLanguageCache(): Promise<void> {
  if (mem) return;
  await fetchAndStore();
}

/** Returns all languages marked active by the API. Falls back to empty array if cache not yet loaded. */
export function getActiveLanguages(): ApiLanguage[] {
  return (mem ?? []).filter((l) => l.isActive === 1);
}

/** Returns true if the language code is RTL per the API. Falls back to known RTL set if cache not ready. */
export function isRtlLanguage(code: string): boolean {
  if (!mem) return ["ar", "ur", "he", "fa"].includes(code);
  const lang = mem.find((l) => l.code === code);
  return lang?.direction === "rtl";
}

/** Returns the full BCP-47 locale string (e.g. "ar-SA") for a language code. */
export function getLocaleCode(code: string): string {
  return mem?.find((l) => l.code === code)?.locale ?? code;
}
