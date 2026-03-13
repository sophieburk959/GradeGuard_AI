import { HistoricalAverage, HistoricalBenchmarkEntry } from "@/lib/types";

export interface ParsedHistoricalDataset {
  records: HistoricalBenchmarkEntry[];
  errors: string[];
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseNumber(value: string): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseHistoricalManifestCsv(csvText: string): ParsedHistoricalDataset {
  const lines = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { records: [], errors: ["Manifest is empty."] };
  }

  const headerCells = lines[0].split(",").map((cell) => normalizeHeader(cell));
  const indexByHeader = new Map<string, number>();
  headerCells.forEach((header, index) => indexByHeader.set(header, index));

  const required = [
    "student_id",
    "student_name",
    "assignment_title",
    "course_id",
    "grade_points",
    "max_points",
    "year",
    "file_name"
  ];

  const missing = required.filter((header) => !indexByHeader.has(header));
  if (missing.length) {
    return {
      records: [],
      errors: [`Manifest is missing required columns: ${missing.join(", ")}`]
    };
  }

  const records: HistoricalBenchmarkEntry[] = [];
  const errors: string[] = [];

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const line = lines[rowIndex];
    const cells = line.split(",").map((cell) => cell.trim());

    const get = (header: string): string => cells[indexByHeader.get(header) ?? -1] ?? "";

    const studentId = get("student_id");
    const studentName = get("student_name");
    const assignmentTitle = get("assignment_title");
    const courseId = get("course_id");
    const fileName = get("file_name");

    const yearValue = parseNumber(get("year"));
    const gradePointsValue = parseNumber(get("grade_points"));
    const maxPointsValue = parseNumber(get("max_points"));
    const gradePercentRaw = parseNumber(get("grade_percent"));

    if (!studentId || !studentName || !assignmentTitle || !courseId || !fileName) {
      errors.push(`Row ${rowIndex + 1}: missing required text values.`);
      continue;
    }

    if (yearValue === null || gradePointsValue === null || maxPointsValue === null || maxPointsValue <= 0) {
      errors.push(`Row ${rowIndex + 1}: invalid numeric values for year/grade_points/max_points.`);
      continue;
    }

    const computedPercent = Math.round((gradePointsValue / maxPointsValue) * 100);
    const gradePercent = gradePercentRaw === null ? computedPercent : Math.round(gradePercentRaw);

    records.push({
      studentId,
      studentName,
      assignmentTitle,
      courseId,
      gradePoints: gradePointsValue,
      maxPoints: maxPointsValue,
      gradePercent,
      year: Math.round(yearValue),
      fileName
    });
  }

  return { records, errors };
}

export function buildHistoricalAveragesFromRecords(
  records: HistoricalBenchmarkEntry[]
): HistoricalAverage[] {
  const byYear = new Map<number, { total: number; count: number }>();

  for (const record of records) {
    const current = byYear.get(record.year) ?? { total: 0, count: 0 };
    current.total += record.gradePercent;
    current.count += 1;
    byYear.set(record.year, current);
  }

  return Array.from(byYear.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([year, aggregate]) => ({
      year,
      averageScore: Math.round(aggregate.total / aggregate.count),
      sampleSize: aggregate.count
    }));
}

export function summarizeManifestFileCoverage(
  records: HistoricalBenchmarkEntry[],
  assignmentFileNames: Set<string>
): { matched: number; missing: string[] } {
  const missing = records
    .map((record) => record.fileName)
    .filter((fileName) => !assignmentFileNames.has(fileName));

  return {
    matched: records.length - missing.length,
    missing
  };
}

export async function hydrateBenchmarkRecordTexts(
  records: HistoricalBenchmarkEntry[],
  files: File[]
): Promise<HistoricalBenchmarkEntry[]> {
  const textByFile = new Map<string, string>();

  for (const file of files) {
    const isTextFile = file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);
    if (!isTextFile) {
      continue;
    }

    const raw = await file.text();
    textByFile.set(file.name, raw.trim().slice(0, 25000));
  }

  return records.map((record) => ({
    ...record,
    contentText: textByFile.get(record.fileName)
  }));
}
