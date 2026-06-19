import type { ServerResponse } from "./serverResponse";

export type QuizOption = {
  text: string;
  optionFiles: string[];
};

export type QuizCorrectAnswer = {
  text: string;
  order: number;
};

export type LessonQuiz = {
  id: string;
  question: string;
  type: string | null;
  options: QuizOption[];
  correct: QuizCorrectAnswer;
};

export type LessonQuizResponse = ServerResponse<LessonQuiz[]>;

export type QuizQuestion = {
  id?: string;
  questionId?: string;
  questionText: string;
  questionType: "multiple_choice" | "short_answer";
  weight: number;
  options: QuizOption[] | { text: string }[];
  correct: QuizCorrectAnswer;
};

export type QuizData = {
  quizSettingsId: string;
  data: QuizQuestion[];
};

export type QuizQuestionPayload = {
  quizSettingsId: string;
  courseId: string;
  questionId?: string;
  questionText: string;
  questionType: "multiple_choice" | "short_answer";
  weight: number;
  options: { text: string }[];
  correct: QuizCorrectAnswer;
};

export type BulkQuizQuestion = {
  questionText: string;
  questionType: "multiple_choice" | "short_answer";
  weight: number;
  options: { text: string }[];
  correct: QuizCorrectAnswer;
};

export type BulkQuizPayload = {
  courseId: string;
  quizSettingsId: string;
  questions: BulkQuizQuestion[];
};

export type QuizSettingsPayload = {
  institutionId: string;
  lessonId?: string;
  topic: string;
  duration: number;
  gradingMethod: "total_mark" | "question_weight";
  totalMark: number | null;
  scoreReleasePolicy: "never" | "manual" | "immediate" | "after_quiz_ends";
  startDate?: string;
  endDate?: string;
};

export type AiDraftParams = {
  courseId: string;
  courseName: string;
  subjectName?: string;
  levelName?: string;
  topic: string;
  count: number;
};

export type QuizSettings = {
  id: string;
  courseId: string;
  institutionId: string;
  lessonId: string | null;
  topic: string;
  duration: number;
  gradingMethod: "total_mark" | "question_weight";
  totalMark: number | null;
  scoreReleasePolicy: "never" | "manual" | "immediate" | "after_quiz_ends";
  startDate?: string;
  endDate?: string;
};
