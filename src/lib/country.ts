import { getCountryByCode } from "@/lib/countryCache";

/** Returns { id, name, emoji, image } for a country code, with safe fallbacks.
 *  `image` is the flag URL returned by the server. */
export function countryInfo(code: string): { id: number; name: string; emoji: string; image: string } {
  const c = getCountryByCode(code);
  return c
    ? { id: c.id, name: c.name, emoji: c.emoji, image: c.image }
    : { id: 0, name: code, emoji: "", image: "" };
}
