import { getCountryByCode } from "@/lib/countryCache";

export type { Country } from "@/lib/countryCache";
export { getAllCountries, getCountryByCode, getCountryById } from "@/lib/countryCache";

const CDN = "https://cdn.jsdelivr.net/npm/country-flag-emoji-json@2.0.0/dist/images";

/** Returns the CDN SVG URL for a country code. Same URL the API stores in `image`. */
export const flagSvg = (code: string) => `${CDN}/${code}.svg`;

/** @deprecated Use getCountryByCode instead */
export const getCountry = getCountryByCode;
