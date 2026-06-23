export type EnrollmentType = "free" | "paid" | "trial";

export type EnrollmentNextAction = "content" | "payment" | "waiting";

export type CohortEnrollmentRequest = {
  cohortId: number;
  profileId: number;
  courseId: number;
  courseName: string;
  cohortName: string;
  programId: number;
  enrollmentType: EnrollmentType;
};

export type EnrollmentResponse = {
  nextAction: EnrollmentNextAction;
};

export type MobilePaymentRequest = {
  cohortId: number;
  profileId: number;
  courseId: number;
  programId: number;
  email: string;
};

export type MobilePaymentResponse = {
  status:| "failed" | 'blocked' | 'pending';
  message?: string;
  paymentUrl: string;
  reference?: string;
};

export type PaymentStatusResponse = {
  message: string;
  nextAction: EnrollmentNextAction;
  paymentStatus: "success" | "failed";
  isPaid: boolean;
};
