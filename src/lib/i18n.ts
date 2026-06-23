import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { locales } from "./locales";

/** flag: ISO 3166-1 alpha-2 country code used by react-country-flag */
export const LOCALES = [
  { code: "ar", label: "العربية",        flag: "SA" },
  { code: "zh", label: "中文",            flag: "CN" },
  { code: "nl", label: "Nederlands",     flag: "NL" },
  { code: "en", label: "English",        flag: "US" },
  { code: "fr", label: "Français",       flag: "FR" },
  { code: "de", label: "Deutsch",        flag: "DE" },
  { code: "ha", label: "Hausa",          flag: "NG" },
  { code: "hi", label: "हिन्दी",          flag: "IN" },
  { code: "ig", label: "Igbo",           flag: "NG" },
  { code: "id", label: "Indonesia",      flag: "ID" },
  { code: "it", label: "Italiano",       flag: "IT" },
  { code: "ja", label: "日本語",          flag: "JP" },
  { code: "ko", label: "한국어",          flag: "KR" },
  { code: "ms", label: "Melayu",         flag: "MY" },
  { code: "pt", label: "Português",      flag: "BR" },
  { code: "ru", label: "Русский",        flag: "RU" },
  { code: "es", label: "Español",        flag: "MX" },
  { code: "sw", label: "Kiswahili",      flag: "KE" },
  { code: "th", label: "ไทย",            flag: "TH" },
  { code: "tr", label: "Türkçe",         flag: "TR" },
  { code: "ur", label: "اردو",           flag: "PK" },
] as const;

export type LocaleCode = typeof LOCALES[number]["code"];

/** Languages that run right-to-left */
export const RTL = new Set(["ar", "ur", "he", "fa"]);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: locales,
    fallbackLng: "en",
    supportedLngs: LOCALES.map((l) => l.code) as string[],
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

export default i18n;
