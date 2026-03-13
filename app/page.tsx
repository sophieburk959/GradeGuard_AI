"use client";

import { AlertTriangle, CheckCircle2, FileText, TrendingUp } from "lucide-react";
import { RecentSubmissionsTable } from "@/components/dashboard/RecentSubmissionsTable";
import { StatCard } from "@/components/ui/StatCard";
import { useAppData } from "@/context/AppDataContext";
import { isEffectivelyFlagged } from "@/lib/reviewStatus";
import { computeAverageScore } from "@/lib/summary";

export default function DashboardPage() {
  const { submissions, historicalAverages } = useAppData();

  const total = submissions.length;
  const graded = submissions.filter((submission) => submission.status === "graded").length;
  const flagged = submissions.filter((submission) => isEffectivelyFlagged(submission, historicalAverages)).length;
  const average = computeAverageScore(submissions);
  const recent = [...submissions]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title font-serif text-5xl">Dashboard</h1>
        <p className="page-subtitle text-3xl">Overview of grading activity</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value={total.toLocaleString()}
          helper="All coursework in queue"
          icon={FileText}
          tone="default"
        />
        <StatCard
          label="Graded"
          value={graded.toLocaleString()}
          helper={`${total ? Math.round((graded / total) * 100) : 0}% complete`}
          icon={CheckCircle2}
          tone="success"
        />
        <StatCard
          label="Flagged for Review"
          value={flagged.toLocaleString()}
          helper="Historical inconsistency alerts"
          icon={AlertTriangle}
          tone="warning"
        />
        <StatCard
          label="Avg. Score"
          value={`${Math.round(average)}%`}
          helper="Across graded submissions"
          icon={TrendingUp}
          tone="default"
        />
      </section>

      <RecentSubmissionsTable
        submissions={recent}
        getFlagged={(submission) => isEffectivelyFlagged(submission, historicalAverages)}
      />
    </div>
  );
}
