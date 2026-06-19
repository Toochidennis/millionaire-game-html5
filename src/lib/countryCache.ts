import type { ApiCountry } from "@/api/models/country.model";
import { gameService } from "@/api/services/game.service";

export interface Country {
  id: number;
  name: string;
  code: string;
  emoji: string;
  image: string;
}

const CACHE_KEY = "mt-countries-v1";

let mem: Country[] | null = null;

function fromStorage(): Country[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Country[]) : null;
  } catch {
    return null;
  }
}

// Pre-populate from localStorage synchronously on module load so sync
// lookups work immediately on page reload without waiting for initCountryCache().
const _stored = fromStorage();
if (_stored?.length) mem = _stored;

export async function initCountryCache(): Promise<void> {
  if (mem) return;
  try {
    const list = (await gameService.getCountries()) as ApiCountry[];
    mem = list.map(({ id, name, code, emoji, image }) => ({ id, name, code, emoji, image }));
    localStorage.setItem(CACHE_KEY, JSON.stringify(mem));
  } catch {
    // API unreachable (CORS in dev, no network, etc.) — mem stays null
  }
}

export function getAllCountries(): Country[] {
  return mem ?? [];
}

export function getCountryByCode(code: string): Country | undefined {
  return mem?.find((c) => c.code === code);
}

export function getCountryById(id: number): Country | undefined {
  return mem?.find((c) => c.id === id);
}
