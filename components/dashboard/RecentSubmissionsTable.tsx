import { Submission } from "@/lib/types";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface RecentSubmissionsTableProps {
  submissions: Submission[];
  getFlagged: (submission: Submission) => boolean;
}

function getRelativeTimeLabel(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function RecentSubmissionsTable({ submissions, getFlagged }: RecentSubmissionsTableProps) {
  return (
    <div className="panel overflow-hidden border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">
        <h2 className="font-serif text-4xl text-slate-900">Recent Submissions</h2>
        <span className="rounded-full bg-slate-100 px-4 py-1 text-sm font-semibold text-slate-700">Live</span>
      </div>

      <div>
        {submissions.map((submission) => (
          <div key={submission.id} className="flex items-center justify-between border-b border-slate-200 px-8 py-5 last:border-b-0">
            <div>
              <p className="text-3xl font-semibold text-slate-900">{submission.assignmentTitle}</p>
              <p className="text-xl text-slate-500">
                {submission.studentName} · {submission.course}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <p className="text-3xl font-semibold text-slate-900">
                {submission.status === "graded" && typeof submission.score === "number"
                  ? `${submission.score}%`
                  : "-"}
              </p>
              <StatusBadge status={submission.status} flagged={getFlagged(submission)} compact />
              <p className="w-20 text-right text-xl text-slate-500">{getRelativeTimeLabel(submission.submittedAt)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
