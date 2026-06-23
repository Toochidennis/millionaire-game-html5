export type NextAction = 'content' | 'description' | 'payment' | 'waiting';

export interface ProgramCourse {
  courseId: number;
  courseName: string;
  description: string;
  imageUrl: string | null;
  slug: string;
  cohortId: number | null;
  isFree: boolean;
  discount: number | null;
  amount: number | null;
  nextAction: NextAction;
}

export interface Program {
  programId: number;
  name: string;
  slug: string;
  courses: ProgramCourse[];
}

export interface ProgramsData {
  programs: Program[];
  enrolledCourses: {
    courses: ProgramCourse[];
  };
}
