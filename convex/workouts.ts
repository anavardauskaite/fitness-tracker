import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getLatestSession = query({
  args: { day: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const session = await ctx.db
      .query("workoutSessions")
      .withIndex("by_userId_and_day", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("day", args.day)
      )
      .order("desc")
      .first();

    if (!session) return null;

    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
      .take(20);

    return { session, logs };
  },
});

export const getSessionHistory = query({
  args: { day: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_userId_and_day", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("day", args.day)
      )
      .order("desc")
      .take(50);

    const result = [];
    for (const session of sessions) {
      const logs = await ctx.db
        .query("exerciseLogs")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
        .take(20);
      result.push({ session, logs });
    }
    return result;
  },
});

export const saveWorkout = mutation({
  args: {
    day: v.number(),
    date: v.string(),
    comment: v.optional(v.string()),
    exercises: v.array(
      v.object({
        exerciseName: v.string(),
        sets: v.array(
          v.object({
            reps: v.number(),
            weight: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const sessionId = await ctx.db.insert("workoutSessions", {
      userId: identity.tokenIdentifier,
      day: args.day,
      date: args.date,
      comment: args.comment,
    });

    for (const exercise of args.exercises) {
      await ctx.db.insert("exerciseLogs", {
        sessionId,
        userId: identity.tokenIdentifier,
        exerciseName: exercise.exerciseName,
        sets: exercise.sets,
      });
    }

    return sessionId;
  },
});

export const deleteSession = mutation({
  args: { sessionId: v.id("workoutSessions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== identity.tokenIdentifier) {
      throw new Error("Session not found");
    }

    // Delete all exercise logs for this session
    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .take(50);

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.sessionId);
  },
});

export const getPersonalRecords = query({
  args: { day: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get all sessions for this day
    const sessions = await ctx.db
      .query("workoutSessions")
      .withIndex("by_userId_and_day", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("day", args.day)
      )
      .take(200);

    const prs: Record<string, { maxWeight: number; maxReps: number }> = {};

    for (const session of sessions) {
      const logs = await ctx.db
        .query("exerciseLogs")
        .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
        .take(20);

      for (const log of logs) {
        for (const set of log.sets) {
          if (!prs[log.exerciseName]) {
            prs[log.exerciseName] = { maxWeight: set.weight, maxReps: set.reps };
          } else {
            if (set.weight > prs[log.exerciseName].maxWeight) {
              prs[log.exerciseName].maxWeight = set.weight;
            }
            if (set.reps > prs[log.exerciseName].maxReps) {
              prs[log.exerciseName].maxReps = set.reps;
            }
          }
        }
      }
    }

    // Return as array to avoid Convex restriction on non-ASCII object keys
    return Object.entries(prs).map(([name, data]) => ({
      exerciseName: name,
      maxWeight: data.maxWeight,
      maxReps: data.maxReps,
    }));
  },
});

export const getExerciseHistory = query({
  args: { exerciseName: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const logs = await ctx.db
      .query("exerciseLogs")
      .withIndex("by_userId_and_exerciseName", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("exerciseName", args.exerciseName)
      )
      .order("desc")
      .take(20);

    const result = [];
    for (const log of logs) {
      const session = await ctx.db.get(log.sessionId);
      if (session) {
        result.push({ ...log, date: session.date });
      }
    }
    return result;
  },
});
