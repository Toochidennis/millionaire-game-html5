import Dexie, { type Table } from "dexie";
import type { Question } from "@/types";
import type { ApiLanguage } from "@/api/models/language.model";

interface QuestionBank {
  languageId: number;
  questions: Question[];
  fetchedAt: number;
}

interface LanguageCache {
  id: number;
  languages: ApiLanguage[];
  fetchedAt: number;
}

interface SeenQuestions {
  langCode: string; // primary key
  ids: string[];
}

class TriviaDB extends Dexie {
  questionBanks!: Table<QuestionBank, number>;
  languageCache!: Table<LanguageCache, number>;
  seenQuestions!: Table<SeenQuestions, string>;

  constructor() {
    super("trivia-millionaire");
    this.version(1).stores({
      questionBanks: "languageId",
      languageCache: "id",
    });
    this.version(2).stores({
      questionBanks: "languageId",
      languageCache: "id",
      seenQuestions: "langCode",
    });
  }
}

export const db = new TriviaDB();
