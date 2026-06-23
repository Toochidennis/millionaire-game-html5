import type { ServerResponse } from "./serverResponse";

export type AssignmentSubmissionPayload = {
  fileName: string;
  file: string;
  type: string;
  oldFileName: string;
};

export type LessonSubmissionPayload = {
  profileId: number;
  cohortId: number;
  quizScore?: number;
  assignment?: AssignmentSubmissionPayload[];
  submissionType: 'text' | 'upload' | 'link' | 'mixed';
  textContent?: string;
  linkUrl?: string; 
};

export type LessonSubmissionResponse = ServerResponse<unknown>;
