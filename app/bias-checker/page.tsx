"use client";

import { ChangeEvent, InputHTMLAttributes, useMemo, useState } from "react";
import { FileSpreadsheet, FolderArchive, TriangleAlert, Upload } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import {
  checkHistoricalConsistency,
  checkProfessorDeviationFromBenchmark,
  parseHistoricalCsv
} from "@/lib/bias";
import { getEffectiveBiasResult, isEffectivelyFlagged } from "@/lib/reviewStatus";
import {
  buildHistoricalAveragesFromRecords,
  hydrateBenchmarkRecordTexts,
  parseHistoricalManifestCsv,
  summarizeManifestFileCoverage
} from "@/lib/historicalDataset";

const folderInputAttrs = {
  webkitdirectory: "",
  directory: ""
} as unknown as InputHTMLAttributes<HTMLInputElement>;

function inferManifestFile(files: File[]): File | undefined {
  return (
    files.find((file) => file.name.toLowerCase() === "manifest.csv") ??
    files.find((file) => file.name.toLowerCase().endsWith(".csv"))
  );
}

export default function BiasCheckerPage() {
  const {
    submissions,
    historicalAverages,
    replaceHistoricalAverages,
    replaceHistoricalBenchmarks
  } = useAppData();
  const [csvInput, setCsvInput] = useState(
    "year,averageScore,sampleSize\n2022,69,118\n2023,71,124\n2024,73,131\n2025,72,127"
  );
  const [importMessage, setImportMessage] = useState("");
  const [datasetMessage, setDatasetMessage] = useState("");

  const gradedSubmissions = useMemo(
    () => submissions.filter((submission) => submission.status === "graded" && typeof submission.score === "number"),
    [submissions]
  );

  const checks = useMemo(
    () =>
      gradedSubmissions.map((submission) => ({
        submission,
        result:
          submission.biasResult ??
          (typeof submission.professorAwardedPercentage === "number" &&
          typeof submission.gradingResult?.benchmarkExpectedPercentage === "number"
            ? checkProfessorDeviationFromBenchmark(
                submission.professorAwardedPercentage,
                submission.gradingResult.benchmarkExpectedPercentage,
                10
              )
            : getEffectiveBiasResult(submission, historicalAverages) ??
              checkHistoricalConsistency(submission.score ?? 0, historicalAverages, 10))
      })),
    [gradedSubmissions, historicalAverages]
  );

  const flaggedChecks = checks.filter((item) =>
    isEffectivelyFlagged(item.submission, historicalAverages) || item.result.isFlagged
  );
  const consistencyScore = checks.length
    ? Math.round(checks.reduce((total, item) => total + item.result.consistencyScore, 0) / checks.length)
    : 100;

  function importFromText() {
    const parsed = parseHistoricalCsv(csvInput);

    if (!parsed.length) {
      setImportMessage("No valid records found. Use format: year,averageScore,sampleSize");
      return;
    }

    replaceHistoricalAverages(parsed);
    setImportMessage(`Imported ${parsed.length} historical rows.`);
  }

  function importFromFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setCsvInput(text);
      const parsed = parseHistoricalCsv(text);
      if (parsed.length) {
        replaceHistoricalAverages(parsed);
        setImportMessage(`Imported ${parsed.length} historical rows from ${file.name}.`);
      } else {
        setImportMessage("File parsed but no valid historical rows were found.");
      }
    };
    reader.readAsText(file);
  }

  async function importDatasetFolder(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const manifestFile = inferManifestFile(files);
    if (!manifestFile) {
      setDatasetMessage("No CSV manifest found. Include a file named manifest.csv in the selected folder.");
      return;
    }

    const manifestText = await manifestFile.text();
    const parsed = parseHistoricalManifestCsv(manifestText);

    if (!parsed.records.length) {
      setDatasetMessage(parsed.errors[0] ?? "Manifest could not be parsed.");
      return;
    }

    const assignmentFiles = new Set(
      files
        .filter((file) => file.name !== manifestFile.name)
        .map((file) => file.name)
    );

    const coverage = summarizeManifestFileCoverage(parsed.records, assignmentFiles);
    const hydratedRecords = await hydrateBenchmarkRecordTexts(parsed.records, files);
    const averages = buildHistoricalAveragesFromRecords(hydratedRecords);

    if (!averages.length) {
      setDatasetMessage("Manifest parsed but no year-level averages could be derived.");
      return;
    }

    replaceHistoricalAverages(averages);
    replaceHistoricalBenchmarks(hydratedRecords);
    setCsvInput(
      ["year,averageScore,sampleSize", ...averages.map((row) => `${row.year},${row.averageScore},${row.sampleSize}`)].join("\n")
    );

    const parseWarnings = parsed.errors.length
      ? ` ${parsed.errors.length} row(s) were skipped due to validation errors.`
      : "";
    const missingWarnings = coverage.missing.length
      ? ` ${coverage.missing.length} manifest file reference(s) are missing in the folder.`
      : "";

    setDatasetMessage(
      `Imported dataset from ${manifestFile.name}: ${hydratedRecords.length} rows, ${coverage.matched}/${hydratedRecords.length} files matched. Benchmark essays are now active for grading.${parseWarnings}${missingWarnings}`
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title font-serif text-5xl">Bias Checker</h1>
        <p className="page-subtitle text-3xl">Compare AI grading against historical patterns to detect bias</p>
      </header>

      <section className="panel rounded-3xl border border-slate-200 p-8">
        <h2 className="font-serif text-4xl text-slate-900">Benchmark Dataset Import</h2>
        <p className="mt-2 text-sm text-slate-600">
          Folder format: one <code>manifest.csv</code> plus assignment files. Required columns:
          <code className="ml-1">student_id,student_name,assignment_title,course_id,grade_points,max_points,year,file_name</code>
          . Optional: <code>grade_percent</code>.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-xl font-medium text-slate-800">
            <FolderArchive className="h-5 w-5" />
            Upload Past Papers Folder
            <input
              type="file"
              multiple
              onChange={importDatasetFolder}
              className="hidden"
              {...folderInputAttrs}
            />
          </label>
        </div>
        {datasetMessage ? <p className="mt-3 text-sm text-slate-700">{datasetMessage}</p> : null}
      </section>

      <section className="panel rounded-3xl border border-slate-200 p-8">
        <h2 className="font-serif text-4xl text-slate-900">Historical Grading Data</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {historicalAverages.map((row) => (
            <article key={row.year} className="rounded-3xl bg-slate-100 p-5 text-center">
              <p className="text-xl text-slate-500">{row.year}</p>
              <p className="mt-1 font-serif text-5xl text-slate-900">{row.averageScore}%</p>
              <p className="mt-1 text-2xl text-slate-500">{row.sampleSize} papers</p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-xl font-medium text-slate-800">
            <Upload className="h-5 w-5" />
            Upload Historical CSV
            <input type="file" accept=".csv,text/csv" onChange={importFromFile} className="hidden" />
          </label>
          <button
            onClick={importFromText}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-xl font-medium text-slate-800"
          >
            <FileSpreadsheet className="h-5 w-5" />
            Import Grade History
          </button>
          <span className="text-xl text-slate-500">CSV, XLSX supported</span>
        </div>

        <textarea
          value={csvInput}
          onChange={(event) => setCsvInput(event.target.value)}
          className="mt-4 min-h-32 w-full rounded-2xl border border-slate-200 p-3 font-mono text-xs"
        />
        {importMessage ? <p className="mt-3 text-sm text-slate-600">{importMessage}</p> : null}
      </section>

      <section className="panel rounded-3xl border border-slate-200 p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif text-4xl text-slate-900">Grading Consistency Score</h2>
          <p className="text-5xl font-semibold text-emerald-600">{consistencyScore}%</p>
        </div>
        <div className="mt-6 h-5 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-navy transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, consistencyScore))}%` }}
          />
        </div>
        <p className="mt-3 text-2xl text-slate-500">
          {consistencyScore}% of AI grades align with historical patterns. {flaggedChecks.length} flagged for manual
          review.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-5xl text-slate-900">Bias Alerts</h2>

        {flaggedChecks.length ? (
          flaggedChecks.map(({ submission, result }) => (
            <article key={submission.id} className="panel rounded-3xl border border-amber-200 bg-amber-50/40 p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <TriangleAlert className="h-6 w-6 text-amber-600" />
                    <p className="text-4xl font-semibold text-slate-900">{submission.studentName}</p>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-lg font-medium text-amber-700">
                      {result.deviation > 0 ? `+${result.deviation}` : result.deviation} pts
                    </span>
                  </div>
                  <p className="mt-2 text-3xl text-slate-600">{submission.assignmentTitle}</p>
                </div>

                <div className="text-right">
                  <p className="font-serif text-6xl text-slate-900">
                    {typeof submission.professorAwardedPercentage === "number"
                      ? submission.professorAwardedPercentage
                      : submission.score}
                  </p>
                  <p className="text-2xl text-slate-500">
                    Expected: {result.expectedMin}-{result.expectedMax}
                  </p>
                </div>
              </div>

              <p className="mt-4 max-w-4xl text-3xl text-slate-700">{result.explanation}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-800">
                  Accept Score
                </button>
                <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-800">
                  Adjust & Re-grade
                </button>
                <button className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xl font-medium text-slate-800">
                  Manual Review
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="panel rounded-3xl border border-slate-200 p-6 text-lg text-slate-600">
            No submissions currently exceed the ±10 consistency range.
          </div>
        )}
      </section>
    </div>
  );
}
