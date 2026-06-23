import type { ServerResponse } from "./serverResponse";

export type Lesson = {
  id: number;
  title: string;
  description: string | null;
  goals: string;
  objectives: string;
  videoUrl?: string;
  recordedVideoUrl: string;
  materialUrl: string;
  assignmentUrl: string;
  certificateUrl: string | null;
  assignmentInstructions: string;
  assignmentSubmissionType: 'text' | 'upload' | 'link' | 'mixed';
  isFinalLesson: boolean;
  displayOrder: number;
  lessonDate: string;
  assignmentDueDate: string | null;
  hasQuiz: boolean;
  liveSessionInfo: {
    url: number;
    meetingId: string;
    passcode: string;
    startTime: string;
    endTime: string;
  } | [];
};

export type SubmissionAssignment = {
  fileName: string;
  file: string;
  type: string;
  oldFileName: string;
};

export type LessonSubmission = {
  assignment: SubmissionAssignment[];
  quizScore: number | null;
  submittedAt: string | null;
  submissionType: 'text' | 'upload' | 'link' | 'mixed';
  textContent?: string;
  linkUrl?: string;
  assignedScore?: number;
  gradedAt?: string;
  notifiedAt?: string;
  remark?: string;
  comment?: string;
};

export type CohortLessonWithSubmission = {
  lesson: Lesson;
  submission: LessonSubmission | null;
};

export type CohortLessonsResponse = ServerResponse<CohortLessonWithSubmission[]>;
