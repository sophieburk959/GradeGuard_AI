import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning";
}

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "border-slate-200 bg-slate-50",
  success: "border-emerald-200 bg-emerald-50",
  warning: "border-amber-200 bg-amber-50"
};

const iconToneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-slate-200 text-slate-700",
  success: "bg-emerald-200 text-emerald-700",
  warning: "bg-amber-200 text-amber-700"
};

export function StatCard({ label, value, helper, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-3xl font-medium text-slate-700">{label}</p>
        <span className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${iconToneClasses[tone]}`}>
          <Icon className="h-6 w-6" />
        </span>
      </div>
      <p className="mt-4 font-serif text-6xl text-slate-900">{value}</p>
      <p className="mt-2 text-2xl text-slate-600">{helper}</p>
    </div>
  );
}
