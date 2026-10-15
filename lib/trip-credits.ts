import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { CREDIT_REFILL_MS } from "@/lib/credit-policy";

const client = () => new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
export async function getCreditAccount() {
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!user || !email) return null;
  const { has } = await auth();
  let isPremium = has({ plan: "monthly" }) || has({ plan: "annually" });
  if (!isPremium) {
    const record = await client().query(api.user.GetUser, { email });
    isPremium = record?.subscription === "monthly" || record?.subscription === "annually";
  }
  return { userId: email, isPremium, capacity: isPremium ? 100 : 2 };
}
export type CreditAccount = NonNullable<Awaited<ReturnType<typeof getCreditAccount>>>;
function credentials(account: CreditAccount) {
  const secret = process.env.TRIP_CREDIT_SECRET;
  if (!secret) throw new Error("Credit service is temporarily unavailable. Please try again.");
  return { secret, userId: account.userId, capacity: account.capacity };
}
function info(account: CreditAccount, state: { remaining: number; updatedAt: number }) {
  return {
    isAuthenticated: true, isPremium: account.isPremium, capacity: account.capacity, remaining: state.remaining,
    resetInfo: state.remaining < account.capacity ? {
      resetAt: new Date(state.updatedAt + CREDIT_REFILL_MS).toISOString(),
      hoursUntilReset: Math.max(0, (state.updatedAt + CREDIT_REFILL_MS - Date.now()) / 3600000),
    } : null,
  };
}
export async function readTripCredits(account: CreditAccount, requestId?: string) {
  try {
    const state = await client().query(api.credits.ReadBalance, { ...credentials(account), requestId });
    return { info: info(account, state), tripPlan: state.tripPlan };
  } catch { throw new Error("Credit service is temporarily unavailable. Please try again."); }
}
export async function commitTripPlan(account: CreditAccount, requestId: string, tripPlan: unknown) {
  try {
    const state = await client().mutation(api.credits.CommitPlan, { ...credentials(account), requestId, tripPlan });
    return { info: info(account, state), denied: state.denied, tripPlan: state.tripPlan };
  } catch { throw new Error("Credit service is temporarily unavailable. Please try again."); }
}
