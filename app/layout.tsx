import type { Metadata } from "next";
import "@/app/globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { AppDataProvider } from "@/context/AppDataContext";

export const metadata: Metadata = {
  title: "GradeGuard AI",
  description: "AI-assisted grading dashboard MVP for educators"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppDataProvider>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
