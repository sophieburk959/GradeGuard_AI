import { NextResponse } from "next/server";
import { checkHistoricalConsistency } from "@/lib/bias";
import { HistoricalAverage } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { score: number; historicalAverages: HistoricalAverage[] };

    if (typeof body.score !== "number") {
      return NextResponse.json({ error: "score is required" }, { status: 400 });
    }

    const result = checkHistoricalConsistency(body.score, body.historicalAverages ?? []);
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
