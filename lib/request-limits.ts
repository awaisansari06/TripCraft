import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function args(userId: string, scope: "ai" | "photo", requestId: string) {
  const secret = process.env.TRIP_CREDIT_SECRET;
  if (!secret) throw new Error("Request service unavailable");
  return { secret, userId, scope, requestId };
}
export async function reserveRequest(userId: string, scope: "ai" | "photo", requestId: string) {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  return client.mutation(api.credits.ReserveRequest, args(userId, scope, requestId));
}
export async function releaseRequest(userId: string, scope: "ai" | "photo", requestId: string) {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  await client.mutation(api.credits.ReleaseRequest, args(userId, scope, requestId));
}
