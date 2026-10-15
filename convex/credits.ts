import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import { availableCredits } from "../lib/credit-policy";

const args = { secret: v.string(), userId: v.string(), capacity: v.number() };
function authorize(secret: string, capacity: number) {
  if (!process.env.TRIP_CREDIT_SECRET || secret !== process.env.TRIP_CREDIT_SECRET) throw new Error("Unauthorized credit operation");
  if (capacity !== 2 && capacity !== 100) throw new Error("Invalid credit capacity");
}
async function balance(ctx: QueryCtx, userId: string, capacity: number, now: number) {
  const stored = await ctx.db.query("TripCreditAccounts").withIndex("by_user", q => q.eq("userId", userId)).unique();
  if (stored) return { stored, value: availableCredits(stored, capacity, now) };
  // Preserve already generated/saved trips when migrating from the broken counter.
  const user = await ctx.db.query("UserTable").filter(q => q.eq(q.field("email"), userId)).first();
  const trips = user ? await ctx.db.query("TripDetailTable").withIndex("by_uid", q => q.eq("uid", user._id)).collect() : [];
  return { stored: null, value: { remaining: Math.max(0, capacity - trips.length), capacity, updatedAt: now } };
}
export const ReadBalance = query({
  args: { ...args, requestId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    authorize(args.secret, args.capacity);
    const receipt = args.requestId ? await ctx.db.query("TripCreditReceipts").withIndex("by_request", q => q.eq("userId", args.userId).eq("requestId", args.requestId!)).unique() : null;
    return { ...(await balance(ctx, args.userId, args.capacity, Date.now())).value, tripPlan: receipt?.tripPlan ?? null };
  },
});
export const CommitPlan = mutation({
  args: { ...args, requestId: v.string(), tripPlan: v.any() },
  handler: async (ctx, args) => {
    authorize(args.secret, args.capacity);
    if (!args.requestId || args.requestId.length > 100) throw new Error("Invalid request ID");
    const receipt = await ctx.db.query("TripCreditReceipts").withIndex("by_request", q => q.eq("userId", args.userId).eq("requestId", args.requestId)).unique();
    const { stored, value } = await balance(ctx, args.userId, args.capacity, Date.now());
    if (receipt) return { ...value, tripPlan: receipt.tripPlan, denied: false };
    if (value.remaining < 1) return { ...value, tripPlan: null, denied: true };
    const next = { ...value, remaining: value.remaining - 1 };
    if (stored) await ctx.db.patch(stored._id, next);
    else await ctx.db.insert("TripCreditAccounts", { userId: args.userId, ...next });
    await ctx.db.insert("TripCreditReceipts", { userId: args.userId, requestId: args.requestId, tripPlan: args.tripPlan });
    return { ...next, tripPlan: args.tripPlan, denied: false };
  },
});

