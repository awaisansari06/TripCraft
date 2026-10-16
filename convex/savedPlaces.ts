import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ownEmail } from "./access";

export const SavePlace = mutation({
    args: {
        userId: v.string(), // We'll stick to string assuming user email or auth ID
        placeName: v.string(),
        placeType: v.string(),
        metadata: v.any(),
        note: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ownEmail(ctx, args.userId);
        // Check if already saved
        const existing = await ctx.db.query("SavedPlacesTable")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("placeName"), args.placeName))
            .first();

        if (existing) {
            if (args.note !== undefined) await ctx.db.patch(existing._id, { notes: args.note });
            return existing._id;
        }

        const newId = await ctx.db.insert("SavedPlacesTable", {
            userId: args.userId,
            placeName: args.placeName,
            placeType: args.placeType,
            metadata: args.metadata,
            notes: args.note ?? ""
        });
        return newId;
    }
});

export const RemovePlace = mutation({
    args: {
        userId: v.string(),
        placeName: v.string()
    },
    handler: async (ctx, args) => {
        await ownEmail(ctx, args.userId);
        const existing = await ctx.db.query("SavedPlacesTable")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("placeName"), args.placeName))
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    }
});

export const UpdateNote = mutation({
    args: {
        userId: v.string(),
        placeName: v.string(),
        note: v.string()
    },
    handler: async (ctx, args) => {
        await ownEmail(ctx, args.userId);
        const existing = await ctx.db.query("SavedPlacesTable")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("placeName"), args.placeName))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { notes: args.note });
        } else {
            // Implicit save on note creation? 
            // For now, assume you must 'Save/Heart' it first or we logic it here.
            // Let's require saving for consistency, but maybe auto-save is better.
            // Returning error or null for now if not saved.
        }
    }
});

export const GetSavedPlace = query({
    args: {
        userId: v.string(),
        placeName: v.string()
    },
    handler: async (ctx, args) => {
        await ownEmail(ctx, args.userId);
        const existing = await ctx.db.query("SavedPlacesTable")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .filter((q) => q.eq(q.field("placeName"), args.placeName))
            .first();
        return existing;
    }
});

export const GetSavedPlaces = query({
    args: {
        userId: v.string()
    },
    handler: async (ctx, args) => {
        await ownEmail(ctx, args.userId);
        const savedPlaces = await ctx.db.query("SavedPlacesTable")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
        return savedPlaces;
    }
});
