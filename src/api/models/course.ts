export type TrialType = "views" | "days" | null;

export interface Course {
  courseId: number;
  courseName: string;
  description: string;
  imageUrl: string | null;
  hasActiveCohort: boolean;
  cohortId: number | null;
  isFree: boolean;
  trialType: TrialType;
  trialValue: number | null;
  cost: number;
  isEnrolled: boolean;
  isCompleted: boolean;
  enrollmentStatus: string | null;
  paymentStatus: string | null;
  lessonsTaken: number | null;
  trialExpiryDate: string | null;
}
