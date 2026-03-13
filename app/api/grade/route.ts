import { NextResponse } from "next/server";
import { generateGradingResult } from "@/lib/grading";
import { HistoricalBenchmarkEntry, MarkScheme, Submission } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      submission: Submission;
      scheme: MarkScheme;
      benchmarks?: HistoricalBenchmarkEntry[];
    };

    if (!body.submission || !body.scheme) {
      return NextResponse.json({ error: "submission and scheme are required" }, { status: 400 });
    }

    const result = generateGradingResult(body.submission, body.scheme, body.benchmarks ?? []);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
