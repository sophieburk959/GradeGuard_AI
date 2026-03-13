export type SubmissionStatus = "pending" | "graded";

export interface Criterion {
  id: string;
  title: string;
  description: string;
  weight: number;
}

export interface MarkScheme {
  id: string;
  schemeName: string;
  course: string;
  criteria: Criterion[];
  updatedAt: string;
}

export interface GradingCriterionResult {
  criterionId: string;
  title: string;
  weight: number;
  score: number;
  feedback: string;
}

export interface GradingResult {
  overallScore: number;
  overallPercentage: number;
  maxScore: number;
  benchmarkExpectedPercentage?: number;
  benchmarkEvidenceCount?: number;
  benchmarkSummary?: string;
  criterionResults: GradingCriterionResult[];
  summaryFeedback: string;
  recommendation: string;
  confidence: number;
}

export interface BiasResult {
  isFlagged: boolean;
  consistencyScore: number;
  expectedMin: number;
  expectedMax: number;
  deviation: number;
  explanation: string;
}

export interface Submission {
  id: string;
  studentName: string;
  studentId: string;
  course: string;
  assignmentTitle: string;
  additionalNotes: string;
  contentText?: string;
  fileName?: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  professorAwardedPoints?: number;
  professorAwardedPercentage?: number;
  flaggedForReview?: boolean;
  reviewReason?: string;
  gradingResult?: GradingResult;
  biasResult?: BiasResult;
}

export interface HistoricalAverage {
  year: number;
  averageScore: number;
  sampleSize: number;
}

export interface HistoricalBenchmarkEntry {
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  courseId: string;
  gradePoints: number;
  maxPoints: number;
  gradePercent: number;
  year: number;
  fileName: string;
  contentText?: string;
}

export interface SubmissionInput {
  studentName: string;
  studentId: string;
  course: string;
  assignmentTitle: string;
  additionalNotes: string;
  contentText?: string;
  fileName?: string;
}
