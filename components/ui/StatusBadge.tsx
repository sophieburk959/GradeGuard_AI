interface StatusBadgeProps {
  status: "pending" | "graded";
  flagged?: boolean;
  compact?: boolean;
}

export function StatusBadge({ status, flagged, compact = false }: StatusBadgeProps) {
  const sizeClasses = compact ? "px-4 py-1 text-sm" : "px-3 py-1 text-xs";

  if (flagged) {
    return (
      <span className={`rounded-full border border-amber-200 bg-amber-50 font-medium text-amber-700 ${sizeClasses}`}>
        flagged
      </span>
    );
  }

  if (status === "graded") {
    return (
      <span className={`rounded-full border border-emerald-200 bg-emerald-50 font-medium text-emerald-700 ${sizeClasses}`}>
        graded
      </span>
    );
  }

  return (
    <span className={`rounded-full border border-slate-200 bg-slate-100 font-medium text-slate-600 ${sizeClasses}`}>
      pending
    </span>
  );
}
