"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CheckSquare, ClipboardCheck, FileStack, Home } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/submit", label: "Submit Work", icon: FileStack },
  { href: "/mark-schemes", label: "Mark Schemes", icon: ClipboardCheck },
  { href: "/results", label: "Grading Results", icon: CheckSquare },
  { href: "/bias-checker", label: "Bias Checker", icon: BarChart3 }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="min-h-screen w-72 bg-brand-navy px-6 py-8 text-slate-100">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">GradeGuard AI</p>
        <h1 className="mt-2 text-xl font-semibold">AI-Assisted Grading</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                active ? "bg-brand-navySoft text-white" : "text-slate-300 hover:bg-brand-navySoft/70"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-brand-gold" : "text-slate-300"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-12 rounded-xl border border-slate-700/70 bg-brand-navySoft/60 p-4">
        <p className="text-xs text-slate-300">MVP Notice</p>
        <p className="mt-2 text-xs leading-relaxed text-slate-200">
          Outputs support grading decisions and can be flagged for manual review.
        </p>
      </div>
    </aside>
  );
}
