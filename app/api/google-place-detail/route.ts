import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { reserveRequest } from "@/lib/request-limits";
import { readJsonBody } from "@/lib/request-body";

const resourcePattern = /^places\/[a-zA-Z0-9_-]+\/photos\/[a-zA-Z0-9_-]+$/;
const sign = (photo: string, expires: string, key: string) => createHmac("sha256", key).update(photo + ":" + expires).digest("hex");

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const parsedBody = await readJsonBody(request, 16 * 1024);
  if (!parsedBody.ok) return NextResponse.json({ error: parsedBody.error }, { status: parsedBody.status });
  const body = parsedBody.value && typeof parsedBody.value === "object" && !Array.isArray(parsedBody.value)
    ? parsedBody.value as Record<string, unknown> : null;
  if (typeof body?.placeName !== "string" || !body.placeName.trim() || body.placeName.length > 300) {
    return NextResponse.json({ error: "Provide a place name of 1–300 characters." }, { status: 400 });
  }
  const key = process.env.GOOGLE_PLACE_API_KEY;
  if (!key) return NextResponse.json({ error: "Place photos are unavailable." }, { status: 503 });
  try {
    const limit = await reserveRequest(user.id, "photo", crypto.randomUUID());
    if (!limit.allowed) return NextResponse.json({ error: "Too many photo lookups. Please try again shortly." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.photos" },
      body: JSON.stringify({ textQuery: body.placeName.trim() }), signal: AbortSignal.timeout(15000),
    });
    if (response.status === 429) return NextResponse.json({ error: "Photo lookup quota is temporarily exhausted." }, { status: 503, headers: { "Retry-After": "60" } });
    if (!response.ok) throw new Error("Place lookup failed");
    const result = await response.json();
    const expires = String(Math.floor(Date.now() / 1000) + 86400);
    const photos: { name: string }[] = result.places?.[0]?.photos ?? [];
    return NextResponse.json(photos.slice(0, 3).filter(photo => resourcePattern.test(photo.name)).map(photo =>
      "/api/google-place-detail?" + new URLSearchParams({ photo: photo.name, expires, signature: sign(photo.name, expires, key) })
    ));
  } catch { return NextResponse.json({ error: "Place photos are temporarily unavailable." }, { status: 502 }); }
}

// Signed image URLs work with Next's image optimizer without exposing the Google key.
export async function GET(request: NextRequest) {
  const photo = request.nextUrl.searchParams.get("photo") ?? "";
  const expires = request.nextUrl.searchParams.get("expires") ?? "";
  const signature = request.nextUrl.searchParams.get("signature") ?? "";
  const key = process.env.GOOGLE_PLACE_API_KEY;
  if (!key) return new NextResponse(null, { status: 503 });
  const now = Math.floor(Date.now() / 1000);
  if (!resourcePattern.test(photo) || !/^\d+$/.test(expires) || Number(expires) < now || Number(expires) > now + 86400 || !/^[a-f0-9]{64}$/.test(signature) ||
      !timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(sign(photo, expires, key), "hex"))) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const url = new URL("https://places.googleapis.com/v1/" + photo + "/media");
    url.search = new URLSearchParams({ maxHeightPx: "1000", maxWidthPx: "1000", key }).toString();
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.startsWith("image/")) throw new Error("Photo unavailable");
    return new NextResponse(response.body, { headers: { "Content-Type": contentType, "Cache-Control": "private, max-age=3600" } });
  } catch { return new NextResponse(null, { status: 502 }); }
}
