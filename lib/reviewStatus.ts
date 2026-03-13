import { checkHistoricalConsistency, checkProfessorDeviationFromBenchmark } from "@/lib/bias";
import { HistoricalAverage, Submission } from "@/lib/types";

export function getEffectiveBiasResult(
  submission: Submission,
  historicalAverages: HistoricalAverage[]
) {
  if (submission.status !== "graded") {
    return null;
  }

  if (
    typeof submission.professorAwardedPercentage === "number" &&
    typeof submission.gradingResult?.benchmarkExpectedPercentage === "number"
  ) {
    return checkProfessorDeviationFromBenchmark(
      submission.professorAwardedPercentage,
      submission.gradingResult.benchmarkExpectedPercentage,
      10
    );
  }

  if (typeof submission.score === "number") {
    return checkHistoricalConsistency(submission.score, historicalAverages, 10);
  }

  return null;
}

export function isEffectivelyFlagged(
  submission: Submission,
  historicalAverages: HistoricalAverage[]
): boolean {
  if (submission.flaggedForReview) {
    return true;
  }

  const result = getEffectiveBiasResult(submission, historicalAverages);
  return Boolean(result?.isFlagged);
}
