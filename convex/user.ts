import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { identity, findAccount } from "./access";

export const GetUser = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const who = await identity(ctx);
        if (who.email !== args.email) throw new Error("Access denied");
        return await findAccount(ctx);
    },
});

export const CreateNewUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        subscription: v.optional(v.string()), // Accept subscription
    },
    handler: async (ctx, args) => {
        const who = await identity(ctx);
        if (args.email !== who.email) throw new Error("Access denied");
        // If User already exist?
        const bound = await ctx.db.query("UserTable").withIndex("by_clerk", q => q.eq("clerkId", who.subject)).unique();
        const user = bound ? [bound] : await ctx.db.query("UserTable")
            .filter((q) => q.eq(q.field("email"), args.email))
            .collect();

        const userData = {
            clerkId: who.subject,
            name: who.name ?? args.name,
            email: who.email!,
            imageUrl: who.pictureUrl ?? args.imageUrl,
            // Plan changes are managed by billing/admins, never by this browser-callable mutation.
        };

        if (user?.length === 0) {
            //If not then create new user
            const newUserId = await ctx.db.insert("UserTable", userData);
            return { ...userData, _id: newUserId, _creationTime: Date.now() };
        } else {
            // Update existing user to sync metadata (e.g. subscription)
            const existingUser = user[0];
            if (existingUser.clerkId && existingUser.clerkId !== who.subject) throw new Error("Access denied");
            await ctx.db.patch(existingUser._id, userData);
            return { ...existingUser, ...userData };
        }
    },
});
