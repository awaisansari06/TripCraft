import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ensureSession, ownTrip, ownUser } from "./access";

export const CreateTripDetail = mutation({
    args: {
        tripId: v.string(),
        uid: v.id("UserTable"),
        tripDetail: v.any(),
    },
    handler: async (ctx, args) => {
        await ownUser(ctx, args.uid);
        const { trip } = await ensureSession(ctx, args.tripId);
        if (trip) {
            await ctx.db.patch(trip._id, { tripDetail: args.tripDetail });
            return trip._id;
        }
        const result = await ctx.db.insert("TripDetailTable", {
            tripDetail: args.tripDetail,
            tripId: args.tripId,
            uid: args.uid, // This might need casting if schema expects v.id
        });

        return result;
    },
});


export const GetUserTrips = query({
    args: {
        uid: v.id("UserTable")
    },
    handler: async (ctx, args) => {
        await ownUser(ctx, args.uid);
        const trips = await ctx.db.query("TripDetailTable")
            .withIndex("by_uid", q => q.eq("uid", args.uid))
            .collect();
        return trips;
    }
})

export const GetTrip = query({
    args: {
        tripId: v.string(),
    },
    handler: async (ctx, args) => {
        const { trip } = await ownTrip(ctx, args.tripId);
        return trip;
    },
});

export const UpdateTrip = mutation({
    args: {
        tripId: v.string(),
        tripDetail: v.any()
    },
    handler: async (ctx, args) => {
        const { trip } = await ownTrip(ctx, args.tripId);

        if (!trip) {
            throw new Error("Trip not found to update");
        }

        await ctx.db.patch(trip._id, {
            tripDetail: args.tripDetail
        });
    },
});

export const DeleteTrip = mutation({
    args: { tripId: v.string() },
    handler: async (ctx, args) => {
        const { trip, session, user } = await ownTrip(ctx, args.tripId);
        if (!trip && !session) throw new Error("Trip unavailable");
        const messages = await ctx.db.query("MessagesTable").withIndex("by_tripId", q => q.eq("tripId", args.tripId)).collect();
        for (const message of messages) await ctx.db.delete(message._id);
        // Old releases could insert duplicate plans for one ID; delete all owned copies.
        const plans = await ctx.db.query("TripDetailTable").withIndex("by_tripId", q => q.eq("tripId", args.tripId)).collect();
        if (plans.some(plan => plan.uid !== user._id)) throw new Error("Access denied");
        for (const plan of plans) await ctx.db.delete(plan._id);
        if (session) await ctx.db.patch(session._id, { deleted: true });
        else await ctx.db.insert("TripSessions", { tripId: args.tripId, uid: user._id, deleted: true });
        // Keep billing receipts: deletion must not refund or reset spent credits.
    },
});
