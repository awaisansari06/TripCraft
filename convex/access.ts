import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

type Context = QueryCtx | MutationCtx;
export async function identity(ctx: Context) {
  const who = await ctx.auth.getUserIdentity();
  if (!who || !who.email || who.emailVerified !== true) throw new Error("A verified account is required");
  return who;
}
export async function findAccount(ctx: Context) {
  const who = await identity(ctx);
  const user = await ctx.db.query("UserTable").withIndex("by_clerk", q => q.eq("clerkId", who.subject)).unique()
    ?? await ctx.db.query("UserTable").filter(q => q.eq(q.field("email"), who.email)).first();
  if (user?.clerkId && user.clerkId !== who.subject) throw new Error("Account unavailable");
  return user;
}
export async function account(ctx: Context) {
  const user = await findAccount(ctx);
  if (!user) throw new Error("Account unavailable");
  return user;
}
export async function ownUser(ctx: Context, uid: Id<"UserTable">) {
  const user = await account(ctx);
  if (user._id !== uid) throw new Error("Access denied");
  return user;
}
export async function ownEmail(ctx: Context, email: string) {
  const user = await account(ctx);
  if (user.email !== email) throw new Error("Access denied");
  return user;
}
export async function ownTrip(ctx: Context, tripId: string) {
  const user = await account(ctx);
  const session = await ctx.db.query("TripSessions").withIndex("by_tripId", q => q.eq("tripId", tripId)).unique();
  const trip = await ctx.db.query("TripDetailTable").withIndex("by_tripId", q => q.eq("tripId", tripId)).first();
  if (session?.deleted || (session && session.uid !== user._id) || (trip && trip.uid !== user._id)) throw new Error("Trip unavailable");
  return { user, session, trip };
}
export async function ensureSession(ctx: MutationCtx, tripId: string) {
  if (!/^[a-zA-Z0-9-]{8,100}$/.test(tripId)) throw new Error("Invalid trip ID");
  const state = await ownTrip(ctx, tripId);
  if (!state.session) {
    // Unowned legacy conversations cannot safely be assigned to whoever asks first.
    const message = await ctx.db.query("MessagesTable").withIndex("by_tripId", q => q.eq("tripId", tripId)).first();
    if (message && !state.trip) throw new Error("Unowned conversation unavailable");
    await ctx.db.insert("TripSessions", { tripId, uid: state.user._id });
  }
  return state;
}
