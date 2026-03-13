import { estimateBenchmarkExpectation } from "@/lib/benchmark";
import {
  GradingCriterionResult,
  GradingResult,
  HistoricalBenchmarkEntry,
  MarkScheme,
  Submission
} from "@/lib/types";

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "about",
  "your",
  "their",
  "have",
  "been",
  "were",
  "there",
  "which",
  "while",
  "also",
  "using"
]);

function hashSeed(value: string): number {
  return Array.from(value).reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 1), 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function unique(tokens: string[]): string[] {
  return Array.from(new Set(tokens));
}

function scoreFeedback(ratio: number, criterionTitle: string, matchRatio: number): string {
  if (ratio >= 0.85) {
    return `${criterionTitle} is strongly evidenced in the submission. Coverage of relevant concepts is high.`;
  }
  if (ratio >= 0.7) {
    return `${criterionTitle} is mostly satisfied. Include clearer supporting detail to strengthen alignment.`;
  }
  if (ratio >= 0.55) {
    return `${criterionTitle} is partially met. Expand the argument and add evidence linked to this criterion.`;
  }

  if (matchRatio < 0.2) {
    return `${criterionTitle} has limited direct coverage in the current draft. Add explicit discussion tied to this rubric point.`;
  }

  return `${criterionTitle} currently falls below expected standard and should be revised before final grading.`;
}

export function generateGradingResult(
  submission: Submission,
  scheme: MarkScheme,
  benchmarks: HistoricalBenchmarkEntry[] = []
): GradingResult {
  const seed = hashSeed(`${submission.studentId}-${submission.assignmentTitle}-${scheme.id}`);
  const baseText = `${submission.contentText ?? ""} ${submission.additionalNotes ?? ""}`.trim();
  const submissionTokens = unique(tokenize(baseText));
  const submissionTokenSet = new Set(submissionTokens);
  const textLength = submissionTokens.length;

  const criterionResults: GradingCriterionResult[] = scheme.criteria.map((criterion, index) => {
    const criterionTokens = unique(tokenize(`${criterion.title} ${criterion.description}`));
    const matched = criterionTokens.filter((token) => submissionTokenSet.has(token)).length;
    const matchRatio = criterionTokens.length ? matched / criterionTokens.length : 0.4;

    const lengthSignal = clamp(textLength / 220, 0, 1);
    const deterministicNoise = (((seed + index * 97) % 15) - 7) / 100;

    const ratio = clamp(0.45 + matchRatio * 0.35 + lengthSignal * 0.2 + deterministicNoise, 0.3, 0.96);
    const score = Math.round(criterion.weight * ratio);

    return {
      criterionId: criterion.id,
      title: criterion.title,
      weight: criterion.weight,
      score,
      feedback: scoreFeedback(score / criterion.weight, criterion.title, matchRatio)
    };
  });

  const rubricScore = criterionResults.reduce((total, item) => total + item.score, 0);
  const maxScore = Math.max(1, scheme.criteria.reduce((total, item) => total + item.weight, 0));
  const rubricPercentage = Math.round((rubricScore / maxScore) * 100);

  const benchmark = estimateBenchmarkExpectation(submission, benchmarks);
  const overallPercentage = benchmark
    ? Math.round(rubricPercentage * 0.65 + benchmark.expectedPercentage * 0.35)
    : rubricPercentage;
  const overallScore = Math.round((overallPercentage / 100) * maxScore);

  const averageCriterionRatio = criterionResults.reduce((sum, item) => sum + item.score / item.weight, 0) /
    Math.max(1, criterionResults.length);
  const confidenceBase = 65 + Math.round(averageCriterionRatio * 20);
  const benchmarkBonus = benchmark ? 5 : 0;
  const confidence = clamp(confidenceBase + Math.round(clamp(textLength / 30, 0, 10)) + benchmarkBonus, 62, 95);

  const recommendation =
    confidence >= 75
      ? "AI-assisted grading suggests standard moderation."
      : "Flagged for manual review due to lower confidence in criterion alignment.";

  const strongest = [...criterionResults]
    .sort((a, b) => b.score / b.weight - a.score / a.weight)
    .slice(0, 2)
    .map((item) => item.title);
  const weakest = [...criterionResults]
    .sort((a, b) => a.score / a.weight - b.score / b.weight)
    .slice(0, 2)
    .map((item) => item.title);

  const summaryFeedback = `Strengths: ${strongest.join(", ")}. Review focus: ${weakest.join(", ")}.`;

  return {
    overallScore,
    overallPercentage,
    maxScore,
    benchmarkExpectedPercentage: benchmark?.expectedPercentage,
    benchmarkEvidenceCount: benchmark?.evidenceCount,
    benchmarkSummary: benchmark?.summary,
    criterionResults,
    summaryFeedback,
    recommendation,
    confidence
  };
}
