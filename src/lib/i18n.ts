import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { locales } from "./locales";

export const LOCALES = [
  { code: "en", label: "English" },   { code: "es", label: "Español" },
  { code: "fr", label: "Français" },  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" }, { code: "it", label: "Italiano" },
  { code: "ru", label: "Русский" },   { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },    { code: "ko", label: "한국어" },
  { code: "ar", label: "العربية" },   { code: "hi", label: "हिन्दी" },
  { code: "tr", label: "Türkçe" },    { code: "id", label: "Indonesia" },
  { code: "nl", label: "Nederlands" },{ code: "pl", label: "Polski" },
  { code: "sw", label: "Kiswahili" }, { code: "yo", label: "Yorùbá" },
  { code: "vi", label: "Tiếng Việt" },{ code: "th", label: "ไทย" },
] as const;

export const RTL = new Set(["ar", "he", "fa", "ur"]);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: locales,
    fallbackLng: "en",
    supportedLngs: LOCALES.map((l) => l.code),
    interpolation: { escapeValue: false },
    detection: { order: ["localStorage", "navigator"], caches: ["localStorage"] },
  });

export default i18n;
