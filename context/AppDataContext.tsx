"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { initialHistoricalAverages, initialMarkSchemes, initialSubmissions } from "@/lib/mockData";
import {
  BiasResult,
  HistoricalAverage,
  HistoricalBenchmarkEntry,
  MarkScheme,
  Submission,
  SubmissionInput
} from "@/lib/types";

interface AppDataContextValue {
  submissions: Submission[];
  markSchemes: MarkScheme[];
  historicalAverages: HistoricalAverage[];
  historicalBenchmarks: HistoricalBenchmarkEntry[];
  addSubmission: (input: SubmissionInput) => void;
  upsertMarkScheme: (scheme: MarkScheme) => void;
  removeMarkScheme: (id: string) => void;
  replaceHistoricalAverages: (items: HistoricalAverage[]) => void;
  replaceHistoricalBenchmarks: (items: HistoricalBenchmarkEntry[]) => void;
  deleteSubmission: (submissionId: string) => void;
  applyGradingResult: (
    submissionId: string,
    score: number,
    gradingResult: Submission["gradingResult"],
    biasResult: BiasResult
  ) => void;
  applyProfessorAssessment: (
    submissionId: string,
    professorAwardedPoints: number,
    professorAwardedPercentage: number,
    biasResult: BiasResult
  ) => void;
}

const STORAGE_KEY = "gradeguard-ai-state-v1";

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

interface StoredState {
  submissions: Submission[];
  markSchemes: MarkScheme[];
  historicalAverages: HistoricalAverage[];
  historicalBenchmarks: HistoricalBenchmarkEntry[];
}

function hasUsableLocalStorage(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const storage = (globalThis as { localStorage?: unknown }).localStorage;

  return Boolean(
    storage &&
      typeof storage === "object" &&
      "getItem" in storage &&
      typeof (storage as Storage).getItem === "function" &&
      "setItem" in storage &&
      typeof (storage as Storage).setItem === "function"
  );
}

function loadState(): StoredState {
  if (!hasUsableLocalStorage()) {
    return {
      submissions: initialSubmissions,
      markSchemes: initialMarkSchemes,
      historicalAverages: initialHistoricalAverages,
      historicalBenchmarks: []
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      submissions: initialSubmissions,
      markSchemes: initialMarkSchemes,
      historicalAverages: initialHistoricalAverages,
      historicalBenchmarks: []
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      submissions: parsed.submissions?.length ? parsed.submissions : initialSubmissions,
      markSchemes: parsed.markSchemes?.length ? parsed.markSchemes : initialMarkSchemes,
      historicalAverages: parsed.historicalAverages?.length
        ? parsed.historicalAverages
        : initialHistoricalAverages,
      historicalBenchmarks: parsed.historicalBenchmarks?.length ? parsed.historicalBenchmarks : []
    };
  } catch {
    return {
      submissions: initialSubmissions,
      markSchemes: initialMarkSchemes,
      historicalAverages: initialHistoricalAverages,
      historicalBenchmarks: []
    };
  }
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [markSchemes, setMarkSchemes] = useState<MarkScheme[]>([]);
  const [historicalAverages, setHistoricalAverages] = useState<HistoricalAverage[]>([]);
  const [historicalBenchmarks, setHistoricalBenchmarks] = useState<HistoricalBenchmarkEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = loadState();
    setSubmissions(initial.submissions);
    setMarkSchemes(initial.markSchemes);
    setHistoricalAverages(initial.historicalAverages);
    setHistoricalBenchmarks(initial.historicalBenchmarks);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!hasUsableLocalStorage()) {
      return;
    }

    const payload: StoredState = {
      submissions,
      markSchemes,
      historicalAverages,
      historicalBenchmarks
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [submissions, markSchemes, historicalAverages, historicalBenchmarks, hydrated]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      submissions,
      markSchemes,
      historicalAverages,
      historicalBenchmarks,
      addSubmission: (input) => {
        const item: Submission = {
          id: `sub-${Date.now()}`,
          studentName: input.studentName,
          studentId: input.studentId,
          course: input.course,
          assignmentTitle: input.assignmentTitle,
          additionalNotes: input.additionalNotes,
          contentText: input.contentText,
          fileName: input.fileName,
          submittedAt: new Date().toISOString(),
          status: "pending"
        };

        setSubmissions((current) => [item, ...current]);
      },
      upsertMarkScheme: (scheme) => {
        setMarkSchemes((current) => {
          const exists = current.some((item) => item.id === scheme.id);
          if (exists) {
            return current.map((item) => (item.id === scheme.id ? scheme : item));
          }

          return [scheme, ...current];
        });
      },
      removeMarkScheme: (id) => {
        setMarkSchemes((current) => current.filter((scheme) => scheme.id !== id));
      },
      replaceHistoricalAverages: (items) => {
        setHistoricalAverages(items);
      },
      replaceHistoricalBenchmarks: (items) => {
        setHistoricalBenchmarks(items);
      },
      deleteSubmission: (submissionId) => {
        setSubmissions((current) => current.filter((submission) => submission.id !== submissionId));
      },
      applyGradingResult: (submissionId, score, gradingResult, biasResult) => {
        setSubmissions((current) =>
          current.map((submission) => {
            if (submission.id !== submissionId) {
              return submission;
            }

            return {
              ...submission,
              status: "graded",
              score,
              gradingResult,
              biasResult,
              flaggedForReview: biasResult.isFlagged,
              reviewReason: biasResult.explanation
            };
          })
        );
      },
      applyProfessorAssessment: (
        submissionId,
        professorAwardedPoints,
        professorAwardedPercentage,
        biasResult
      ) => {
        setSubmissions((current) =>
          current.map((submission) => {
            if (submission.id !== submissionId) {
              return submission;
            }

            return {
              ...submission,
              professorAwardedPoints,
              professorAwardedPercentage,
              biasResult,
              flaggedForReview: biasResult.isFlagged,
              reviewReason: biasResult.explanation
            };
          })
        );
      }
    }),
    [historicalAverages, historicalBenchmarks, markSchemes, submissions]
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-slate text-sm text-slate-600">
        Loading GradeGuard AI...
      </div>
    );
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider");
  }

  return context;
}
