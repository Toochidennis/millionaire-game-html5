import { apiRequest } from "../client";
import type { ApiLanguage } from "../models/language.model";

export interface ApiQuestion {
  id: number;
  questionText: string;
  explanation: string;
  options: { text: string }[];
  correct: { text: string; order: number };
}

export interface ApiQuestionsData {
  languageId: number;
  language: string;
  levels: { level: number; questions: ApiQuestion[] }[];
}

export interface ApiRank {
  rank: number;
  total: number;       // total players in the scope
  countryCode: string;
}

export const gameService = {
  async getCountries() {
    const response = await apiRequest(`/games/countries`, { method: "GET" });
    return response.data;
  },

  async getLanguages(): Promise<ApiLanguage[]> {
    const response = await apiRequest<ApiLanguage[]>(`/games/languages`, { method: "GET" });
    return response.data;
  },

  async getQuestions(languageId: number): Promise<ApiQuestionsData> {
    const response = await apiRequest<ApiQuestionsData>(
      `/games/questions?language_id=${languageId}`,
      { method: "GET" }
    );
    return response.data;
  },

  // Player's country rank. Not yet live on the backend — `getMyRank` in lib/rank.ts
  // serves mock data until USE_MOCK_RANK is flipped off.
  async getMyRank(countryCode: string): Promise<ApiRank> {
    const response = await apiRequest<ApiRank>(
      `/games/rank?country=${encodeURIComponent(countryCode)}`,
      { method: "GET" }
    );
    return response.data;
  },
};
