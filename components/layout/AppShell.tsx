import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-brand-slate">
      <Sidebar />
      <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
    </div>
  );
}
