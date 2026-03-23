import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  workoutSessions: defineTable({
    userId: v.string(),
    day: v.number(), // 1 or 2
    date: v.string(), // ISO date string YYYY-MM-DD
    comment: v.optional(v.string()),
  })
    .index("by_userId_and_day", ["userId", "day"])
    .index("by_userId_and_date", ["userId", "date"]),

  exerciseLogs: defineTable({
    sessionId: v.id("workoutSessions"),
    userId: v.string(),
    exerciseName: v.string(),
    sets: v.array(
      v.object({
        reps: v.number(),
        weight: v.number(),
      })
    ),
  })
    .index("by_sessionId", ["sessionId"])
    .index("by_userId_and_exerciseName", ["userId", "exerciseName"]),

  runningLogs: defineTable({
    userId: v.string(),
    date: v.string(),
    time: v.number(), // duration in minutes
    distance: v.number(), // in km
    avgHeartRate: v.number(), // bpm
  })
    .index("by_userId", ["userId"]),

  bodyMeasurements: defineTable({
    userId: v.string(),
    date: v.string(), // ISO date string YYYY-MM-DD
    weight: v.optional(v.number()),
    chest: v.optional(v.number()),
    waist: v.optional(v.number()),
    hips: v.optional(v.number()),
    bicepLeft: v.optional(v.number()),
    bicepRight: v.optional(v.number()),
    thighLeft: v.optional(v.number()),
    thighRight: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_date", ["userId", "date"]),
});
