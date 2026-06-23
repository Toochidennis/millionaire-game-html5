export type TrialType = "views" | "days" | null;

/** Flat cohort shape returned by the learning/lessons endpoint (by numeric ID). */
export interface Cohort {
  id: number;
  programId: number;
  courseId: number;
  slug: string;
  courseName: string;
  title: string;
  description: string;
  benefits: string | null;
  startDate: string;
  endDate: string;
  status: string;
  imageUrl: string | null;
  deliveryMode: string | null;
  zoomLink: string | null;
  isFree: number | boolean;
  trialType: TrialType;
  trialValue: number;
  cost: string;
  instructorName: string | null;
}

export interface CohortProgram {
  id: number;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  sponsor: string | null;
  startDate: string | null;
  videoUrl: string | null;
  onboardingSteps: any | null;
  whatsappGroupLink: string | null;
}

export interface CohortCourse {
  courseId: number;
  slug: string;
  courseName: string;
  description: string;
  imageUrl: string | null;
}

export interface CohortDetail {
  cohortId: number;
  slug: string;
  title: string;
  description: string;
  benefits: string | null;
  startDate: string | null;
  endDate: string | null;
  instructorName: string | null;
  discount: number | null;
  cost: number | null;
  trialType: TrialType;
  trialValue: number;
  deliveryMode: string | null;
  videoUrl: string | null;
  isFree: boolean;
  imageUrl: string | null;
  enrollmentDeadline: string | null;
  learningType: string | null;
  whatsappGroupLink: string | null;
  hasEnrolled: boolean;
}

export interface CohortResponse {
  program: CohortProgram;
  course: CohortCourse;
  cohort: CohortDetail;
}
