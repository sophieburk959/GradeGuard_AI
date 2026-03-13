import { Submission } from "@/lib/types";

export function computeAverageScore(submissions: Submission[]): number {
  const graded = submissions.filter((submission) => submission.status === "graded" && typeof submission.score === "number");

  if (!graded.length) {
    return 0;
  }

  const total = graded.reduce((sum, submission) => sum + (submission.score ?? 0), 0);
  return Math.round((total / graded.length) * 10) / 10;
}
