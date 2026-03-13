"use client";

import { FormEvent, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Submission } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface ResultCardProps {
  submission: Submission;
  onDelete: () => void;
  onApplyProfessorScore: (awardedPoints: number) => void;
}

export function ResultCard({ submission, onDelete, onApplyProfessorScore }: ResultCardProps) {
  const [open, setOpen] = useState(false);
  const maxScore = submission.gradingResult?.maxScore ?? 100;
  const overallPercentage =
    submission.gradingResult?.overallPercentage ??
    (typeof submission.score === "number" ? submission.score : undefined);

  const [awardedInput, setAwardedInput] = useState<string>(
    submission.professorAwardedPoints?.toString() ?? ""
  );

  const professorPreview = useMemo(() => {
    const points = Number(awardedInput);
    if (!Number.isFinite(points) || points < 0) {
      return null;
    }

    return Math.round((points / Math.max(1, maxScore)) * 100);
  }, [awardedInput, maxScore]);

  function onSubmitProfessorScore(event: FormEvent) {
    event.preventDefault();
    const points = Number(awardedInput);

    if (!Number.isFinite(points) || points < 0 || points > maxScore) {
      return;
    }

    onApplyProfessorScore(points);
  }

  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{submission.course}</p>
          <h3 className="text-lg font-semibold text-slate-900">{submission.assignmentTitle}</h3>
          <p className="text-sm text-slate-600">
            {submission.studentName} ({submission.studentId})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-2xl font-semibold text-slate-900">
            {typeof submission.score === "number" ? `${submission.score}%` : "-"}
          </p>
          <StatusBadge status={submission.status} flagged={submission.flaggedForReview} />
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => setOpen((state) => !state)}
          >
            {open ? (
              <span className="inline-flex items-center gap-1">
                Hide <ChevronUp className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                Details <ChevronDown className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg border border-rose-200 px-3 py-2 text-xs text-rose-700"
          >
            Delete
          </button>
        </div>
      </div>

      {open && submission.gradingResult ? (
        <div className="mt-5 space-y-4 border-t border-slate-100 pt-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Overall</p>
              <p className="text-xl font-semibold text-slate-900">
                {submission.gradingResult.overallScore}/{maxScore}
              </p>
              <p className="text-sm text-slate-600">
                {typeof overallPercentage === "number" ? `${overallPercentage}%` : "-"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">AI Confidence</p>
              <p className="text-xl font-semibold text-slate-900">{submission.gradingResult.confidence}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Professor Award</p>
              <p className="text-xl font-semibold text-slate-900">
                {typeof submission.professorAwardedPoints === "number"
                  ? `${submission.professorAwardedPoints}/${maxScore}`
                  : "Not set"}
              </p>
              <p className="text-sm text-slate-600">
                {typeof submission.professorAwardedPercentage === "number"
                  ? `${submission.professorAwardedPercentage}%`
                  : "Awaiting professor score"}
              </p>
            </div>
          </div>

          <form onSubmit={onSubmitProfessorScore} className="rounded-xl border border-slate-100 p-3">
            <p className="text-sm font-medium text-slate-800">Professor awarded score (comparative fairness check)</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                type="number"
                min={0}
                max={maxScore}
                step="0.5"
                value={awardedInput}
                onChange={(event) => setAwardedInput(event.target.value)}
                className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder={`0-${maxScore}`}
              />
              <span className="text-sm text-slate-600">out of {maxScore}</span>
              <button className="rounded-lg bg-brand-navy px-3 py-2 text-sm text-white">
                Apply professor score
              </button>
              {typeof professorPreview === "number" ? (
                <span className="text-sm text-slate-500">Preview: {professorPreview}%</span>
              ) : null}
            </div>
          </form>

          <div className="space-y-2">
            {submission.gradingResult.criterionResults.map((criterion) => (
              <div key={criterion.criterionId} className="rounded-xl border border-slate-100 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-800">{criterion.title}</p>
                  <p className="text-sm text-slate-600">
                    {criterion.score}/{criterion.weight}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-600">{criterion.feedback}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-brand-slate p-4">
            <p className="text-sm font-medium text-slate-800">Summary feedback</p>
            <p className="mt-1 text-sm text-slate-600">{submission.gradingResult.summaryFeedback}</p>
            {typeof submission.gradingResult.benchmarkExpectedPercentage === "number" ? (
              <p className="mt-2 text-xs text-slate-600">
                Historical benchmark expectation: {submission.gradingResult.benchmarkExpectedPercentage}% based on{" "}
                {submission.gradingResult.benchmarkEvidenceCount ?? 0} prior paper(s).
              </p>
            ) : null}
            {submission.gradingResult.benchmarkSummary ? (
              <p className="mt-1 text-xs text-slate-500">{submission.gradingResult.benchmarkSummary}</p>
            ) : null}
            {submission.biasResult ? (
              <p className="mt-2 text-xs text-slate-500">{submission.biasResult.explanation}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
