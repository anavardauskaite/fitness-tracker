import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("runningLogs")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.tokenIdentifier)
      )
      .order("desc")
      .take(100);
  },
});

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("runningLogs")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.tokenIdentifier)
      )
      .order("desc")
      .first();
  },
});

export const save = mutation({
  args: {
    date: v.string(),
    time: v.number(),
    distance: v.number(),
    avgHeartRate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db.insert("runningLogs", {
      userId: identity.tokenIdentifier,
      ...args,
    });
  },
});
