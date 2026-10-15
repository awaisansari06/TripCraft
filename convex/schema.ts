import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    TripCreditAccounts: defineTable({
        userId: v.string(),
        remaining: v.number(),
        capacity: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),
    TripCreditReceipts: defineTable({
        userId: v.string(),
        requestId: v.string(),
        tripPlan: v.any(),
    }).index("by_request", ["userId", "requestId"]),
    UserTable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        subscription: v.optional(v.string()),
    }),
    TripDetailTable: defineTable({
        tripId: v.string(),
        tripDetail: v.any(),
        uid: v.id('UserTable')
    }).index("by_tripId", ["tripId"]).index("by_uid", ["uid"]),
    MessagesTable: defineTable({
        tripId: v.string(),
        role: v.string(),
        content: v.string(),
        ui: v.optional(v.string()), // For UiRenderer logic
        timestamp: v.optional(v.string())
    }).index("by_tripId", ["tripId"]),
    SavedPlacesTable: defineTable({
        userId: v.string(), // Use string to match UserTable logic if needed, or v.id('UserTable')
        placeName: v.string(),
        placeType: v.string(), // 'hotel' | 'activity'
        notes: v.optional(v.string()), // Personal notes can live here too if we treat "saved" == "interacted"
        metadata: v.any() // Store full object ref for fast retrieval
    }).index("by_user", ["userId"])
})
