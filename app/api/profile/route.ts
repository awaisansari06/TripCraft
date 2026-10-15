import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Compatibility for older clients; only the current user's public profile fields.
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  return NextResponse.json({
    id: user.id,
    name: user.fullName,
    email: user.primaryEmailAddress?.emailAddress ?? null,
    imageUrl: user.imageUrl,
  }, { headers: { "Cache-Control": "private, no-store" } });
}
