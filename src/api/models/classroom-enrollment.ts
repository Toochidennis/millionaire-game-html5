export type ClassroomCourseEnrollmentPayload = {
    joinCode: string;
    institutionId: string;
    studentId: string;
};

export type ClassroomCourseEnrollmentResponse = unknown;

export type ClassroomAssessment = {
    id: string;
    courseId: string;
    lessonId: string | null;
    topic: string;
    duration: number;
    gradingMethod: "total_mark" | "question_weight";
    totalMark: number | null;
    scoreReleasePolicy: "never" | "manual" | "immediate" | "after_quiz_ends";
    startDate: string | null;
    endDate: string | null;
    maxAttempt: number | null;
};

export type EnrolledClassroomCourse = {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    pricingType: string;
    price: string | number | null;
};

export type EnrolledClassroomCourseRecord = {
    course: EnrolledClassroomCourse;
    assessments: ClassroomAssessment[];
};
