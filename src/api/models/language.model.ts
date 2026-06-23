export interface ApiLanguage {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  locale: string;
  direction: "ltr" | "rtl";
  flag: string;
  isDefault: number;
  isActive: number;
  translationSupported: number;
  createdAt: string;
  updatedAt: string;
}
