"use client";

import { useMemo, useState } from "react";
import { ResultCard } from "@/components/results/ResultCard";
import { useAppData } from "@/context/AppDataContext";
import { checkProfessorDeviationFromBenchmark } from "@/lib/bias";
import { MarkScheme, Submission } from "@/lib/types";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function pickScheme(submission: Submission, schemes: MarkScheme[]): MarkScheme | null {
  const courseSchemes = schemes.filter(
    (scheme) => normalize(scheme.course) === normalize(submission.course)
  );

  if (!courseSchemes.length) {
    return schemes[0] ?? null;
  }

  const assignmentMatch = courseSchemes.find((scheme) => {
    const schemeName = normalize(scheme.schemeName);
    const assignmentTitle = normalize(submission.assignmentTitle);
    return schemeName.includes(assignmentTitle) || assignmentTitle.includes(schemeName);
  });

  return assignmentMatch ?? courseSchemes[0] ?? null;
}

export default function ResultsPage() {
  const {
    submissions,
    markSchemes,
    historicalBenchmarks,
    applyGradingResult,
    applyProfessorAssessment,
    deleteSubmission
  } = useAppData();
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = useMemo(
    () => submissions.filter((submission) => submission.status === "pending"),
    [submissions]
  );
  const graded = useMemo(
    () => submissions.filter((submission) => submission.status === "graded"),
    [submissions]
  );

  async function gradeSubmission(submission: Submission) {
    const scheme = pickScheme(submission, markSchemes);

    if (!scheme) {
      return;
    }

    setBusyId(submission.id);

    const gradingResponse = await fetch("/api/grade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission,
        scheme,
        benchmarks: historicalBenchmarks
      })
    });

    const gradingPayload = await gradingResponse.json();
    applyGradingResult(submission.id, gradingPayload.overallPercentage, gradingPayload, {
      isFlagged: false,
      consistencyScore: 100,
      expectedMin: Math.max(
        0,
        (gradingPayload.benchmarkExpectedPercentage ?? gradingPayload.overallPercentage) - 10
      ),
      expectedMax: Math.min(
        100,
        (gradingPayload.benchmarkExpectedPercentage ?? gradingPayload.overallPercentage) + 10
      ),
      deviation: 0,
      explanation:
        "Awaiting professor-awarded score. Fairness check will compare awarded score against benchmark expectation (±10)."
    });
    setBusyId(null);
  }

  function applyProfessorScore(submission: Submission, awardedPoints: number) {
    if (!submission.gradingResult) {
      return;
    }

    const maxPoints = Math.max(1, submission.gradingResult.maxScore);
    const professorAwardedPercentage = Math.round((awardedPoints / maxPoints) * 100);
    const benchmarkExpectedPercentage =
      submission.gradingResult.benchmarkExpectedPercentage ?? submission.gradingResult.overallPercentage;
    const biasResult = checkProfessorDeviationFromBenchmark(
      professorAwardedPercentage,
      benchmarkExpectedPercentage,
      10
    );

    applyProfessorAssessment(
      submission.id,
      awardedPoints,
      professorAwardedPercentage,
      biasResult
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Grading Results</h1>
        <p className="page-subtitle">
          Review AI-assisted grading outputs with criterion-level feedback and moderation signals.
        </p>
      </header>

      <section className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Pending Submissions</h2>
          <p className="text-xs text-slate-500">{pending.length} awaiting grading</p>
        </div>

        {pending.length ? (
          <div className="space-y-3">
            {pending.map((submission) => (
              <div
                key={submission.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
              >
                <div>
                  <p className="font-medium text-slate-800">{submission.studentName}</p>
                  <p className="text-sm text-slate-600">
                    {submission.course} • {submission.assignmentTitle}
                  </p>
                </div>
                <button
                  onClick={() => gradeSubmission(submission)}
                  disabled={busyId === submission.id}
                  className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {busyId === submission.id ? "Grading..." : "Run rubric grading"}
                </button>
                <button
                  onClick={() => deleteSubmission(submission.id)}
                  className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No pending items.</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Completed Results</h2>
        {graded.length ? (
          graded.map((submission) => (
            <ResultCard
              key={submission.id}
              submission={submission}
              onDelete={() => deleteSubmission(submission.id)}
              onApplyProfessorScore={(awardedPoints) => applyProfessorScore(submission, awardedPoints)}
            />
          ))
        ) : (
          <div className="panel p-5 text-sm text-slate-500">No graded submissions yet.</div>
        )}
      </section>
    </div>
  );
}
