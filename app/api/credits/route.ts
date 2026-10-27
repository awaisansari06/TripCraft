import { NextResponse } from "next/server";
import { getCreditAccount, readTripCredits } from "@/lib/trip-credits";

export async function GET() {
  try {
    const account = await getCreditAccount();
    if (!account) return NextResponse.json({ isAuthenticated: false, isPremium: false, remaining: 0, capacity: 2, resetInfo: null }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
    const { info } = await readTripCredits(account);
    return NextResponse.json(info, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    console.error("Credit service unavailable in GET /api/credits.");
    return NextResponse.json({ error: "Credit service is temporarily unavailable. Please try again." }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}
