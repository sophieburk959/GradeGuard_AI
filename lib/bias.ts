import { BiasResult, HistoricalAverage } from "@/lib/types";

export function checkHistoricalConsistency(
  score: number,
  historicalAverages: HistoricalAverage[],
  rangeWindow = 10
): BiasResult {
  if (!historicalAverages.length) {
    return {
      isFlagged: false,
      consistencyScore: 100,
      expectedMin: 0,
      expectedMax: 100,
      deviation: 0,
      explanation:
        "No historical data available. This submission should still be reviewed through normal moderation."
    };
  }

  const weightedTotal = historicalAverages.reduce(
    (acc, entry) => {
      acc.score += entry.averageScore * entry.sampleSize;
      acc.count += entry.sampleSize;
      return acc;
    },
    { score: 0, count: 0 }
  );

  const historicalMean = weightedTotal.score / weightedTotal.count;
  const expectedMin = Math.max(0, Math.round(historicalMean - rangeWindow));
  const expectedMax = Math.min(100, Math.round(historicalMean + rangeWindow));
  const deviation = Math.round(score - historicalMean);
  const isFlagged = score < expectedMin || score > expectedMax;
  const consistencyScore = Math.max(0, Math.round(100 - Math.abs(deviation) * 3));

  const explanation = isFlagged
    ? `This result is ${Math.abs(deviation)} points ${deviation > 0 ? "above" : "below"} the historical average and outside the allowed ±${rangeWindow} range (${expectedMin}-${expectedMax}), so it is flagged for manual review.`
    : `This result is ${Math.abs(deviation)} points from the historical average and remains within the allowed ±${rangeWindow} range (${expectedMin}-${expectedMax}).`;

  return {
    isFlagged,
    consistencyScore,
    expectedMin,
    expectedMax,
    deviation,
    explanation
  };
}

export function checkProfessorDeviationFromBenchmark(
  professorPercentage: number,
  benchmarkExpectedPercentage: number,
  rangeWindow = 10
): BiasResult {
  const expectedMin = Math.max(0, Math.round(benchmarkExpectedPercentage - rangeWindow));
  const expectedMax = Math.min(100, Math.round(benchmarkExpectedPercentage + rangeWindow));
  const deviation = Math.round(professorPercentage - benchmarkExpectedPercentage);
  const isFlagged = professorPercentage < expectedMin || professorPercentage > expectedMax;
  const consistencyScore = Math.max(0, Math.round(100 - Math.abs(deviation) * 4));

  const explanation = isFlagged
    ? `Professor-awarded score is ${Math.abs(deviation)} points ${deviation > 0 ? "above" : "below"} the benchmark expectation and outside the allowed ±${rangeWindow} range (${expectedMin}-${expectedMax}). Flagged for manual fairness review.`
    : `Professor-awarded score is ${Math.abs(deviation)} points from the benchmark expectation and within the allowed ±${rangeWindow} range (${expectedMin}-${expectedMax}).`;

  return {
    isFlagged,
    consistencyScore,
    expectedMin,
    expectedMax,
    deviation,
    explanation
  };
}

export function parseHistoricalCsv(csvText: string): HistoricalAverage[] {
  const lines = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed: HistoricalAverage[] = [];

  for (const line of lines) {
    const [yearRaw, averageRaw, sampleRaw] = line.split(",").map((cell) => cell.trim());

    if (!yearRaw || !averageRaw || !sampleRaw || yearRaw.toLowerCase() === "year") {
      continue;
    }

    const year = Number(yearRaw);
    const averageScore = Number(averageRaw);
    const sampleSize = Number(sampleRaw);

    if (
      Number.isFinite(year) &&
      Number.isFinite(averageScore) &&
      Number.isFinite(sampleSize) &&
      sampleSize > 0
    ) {
      parsed.push({ year, averageScore, sampleSize });
    }
  }

  return parsed.sort((a, b) => a.year - b.year);
}
