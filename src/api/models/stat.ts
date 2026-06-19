import type { Course } from "./course";

interface StatProgram {
  programId: number;
  name: string;
  courses: Course[];
}

export type LearningStats = {
  totalCoursesEnrolled: number;
  totalLessonsCompleted: number;
  totalQuizzesTaken?: number;
  overallQuizScore: number;
  lessonsCompleted: number;
  totalLessons: number;
  programs: StatProgram[];
}
