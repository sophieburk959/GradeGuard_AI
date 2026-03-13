import { HistoricalBenchmarkEntry, Submission } from "@/lib/types";

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

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const aSet = new Set(a);
  const bSet = new Set(b);

  if (!aSet.size || !bSet.size) {
    return 0;
  }

  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) {
      intersection += 1;
    }
  }

  const union = aSet.size + bSet.size - intersection;
  return union > 0 ? intersection / union : 0;
}

export interface BenchmarkEstimate {
  expectedPercentage: number;
  evidenceCount: number;
  summary: string;
}

export function estimateBenchmarkExpectation(
  submission: Submission,
  benchmarks: HistoricalBenchmarkEntry[]
): BenchmarkEstimate | null {
  const course = normalize(submission.course);
  const assignment = normalize(submission.assignmentTitle);

  const relevant = benchmarks.filter(
    (entry) => normalize(entry.courseId) === course && normalize(entry.assignmentTitle) === assignment
  );

  if (!relevant.length) {
    return null;
  }

  const submissionTokens = tokenize(submission.contentText ?? submission.additionalNotes ?? "");

  if (!submissionTokens.length) {
    const average = Math.round(
      relevant.reduce((sum, entry) => sum + entry.gradePercent, 0) / relevant.length
    );
    return {
      expectedPercentage: average,
      evidenceCount: relevant.length,
      summary: `Benchmark based on ${relevant.length} prior graded papers with matching course and assignment metadata.`
    };
  }

  const scored = relevant
    .map((entry) => {
      const entryTokens = tokenize(entry.contentText ?? "");
      return {
        entry,
        similarity: jaccardSimilarity(submissionTokens, entryTokens)
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);

  const totalWeight = scored.reduce((sum, row) => sum + Math.max(0.05, row.similarity), 0);
  const weightedPercent =
    scored.reduce((sum, row) => sum + row.entry.gradePercent * Math.max(0.05, row.similarity), 0) /
    totalWeight;

  return {
    expectedPercentage: Math.round(weightedPercent),
    evidenceCount: scored.length,
    summary: `Benchmark based on ${scored.length} most similar prior paper(s) graded by instructor history.`
  };
}
