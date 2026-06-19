import { getCountryByCode, flagSvg } from "@/data/countries";

/** Returns { id, name, emoji, flagSvg } for a country code, with safe fallbacks. */
export function countryInfo(code: string): { id: number; name: string; emoji: string; flagSvg: string } {
  const c = getCountryByCode(code);
  return c
    ? { id: c.id, name: c.name, emoji: c.emoji, flagSvg: flagSvg(c.code) }
    : { id: 0, name: code, emoji: "", flagSvg: "" };
}
