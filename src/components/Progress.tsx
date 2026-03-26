import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import type { Id } from "../../convex/_generated/dataModel";

type TimeRange = "week" | "month" | "all";

function formatChange(current: number, previous: number): string {
  const diff = current - previous;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}`;
}

function ProgressBar({
  label,
  current,
  max,
}: {
  label: string;
  current: number;
  max: number;
}) {
  const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-zinc-400">{label}</span>
        <span className="text-white">{current}</span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function WorkoutHistory() {
  const [historyDay, setHistoryDay] = useState<1 | 2>(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const allSessions = useQuery(api.workouts.getSessionHistory, { day: historyDay });
  const deleteSession = useMutation(api.workouts.deleteSession);

  const handleDelete = async (sessionId: Id<"workoutSessions">) => {
    setDeleting(true);
    try {
      await deleteSession({ sessionId });
      setConfirmDeleteId(null);
      setExpandedId(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Workout History</h3>
        <div className="flex gap-1">
          <button
            onClick={() => { setHistoryDay(1); setExpandedId(null); setConfirmDeleteId(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              historyDay === 1
                ? "bg-violet-600/30 text-violet-300"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Front
          </button>
          <button
            onClick={() => { setHistoryDay(2); setExpandedId(null); setConfirmDeleteId(null); }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              historyDay === 2
                ? "bg-violet-600/30 text-violet-300"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Back
          </button>
        </div>
      </div>

      {allSessions && allSessions.length > 0 ? (
        <div className="space-y-2">
          {allSessions.map(({ session, logs }) => {
            const isExpanded = expandedId === session._id;
            const isConfirming = confirmDeleteId === session._id;

            return (
              <div
                key={session._id}
                className="border border-zinc-700/50 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => {
                    setExpandedId(isExpanded ? null : session._id);
                    setConfirmDeleteId(null);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-700/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 text-sm font-medium">
                      {session.date}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {logs.length} exercises
                    </span>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3">
                    {session.comment && (
                      <p className="text-zinc-500 text-xs italic">{session.comment}</p>
                    )}

                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div key={log._id} className="bg-zinc-700/30 rounded-lg p-2.5">
                          <span className="text-zinc-300 text-xs font-medium block mb-1.5">
                            {log.exerciseName}
                          </span>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            <span className="text-zinc-500">Set</span>
                            <span className="text-zinc-500">Reps</span>
                            <span className="text-zinc-500">Weight</span>
                            {log.sets.map((set, i) => (
                              <div key={i} className="contents">
                                <span className="text-zinc-400">{i + 1}</span>
                                <span className="text-white">{set.reps}</span>
                                <span className="text-white">{set.weight}kg</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {isConfirming ? (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-red-400 text-xs">Delete this workout?</span>
                        <button
                          onClick={() => void handleDelete(session._id)}
                          disabled={deleting}
                          className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting ? "..." : "Yes, delete"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 px-2 py-1 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(session._id)}
                        className="text-xs text-zinc-600 hover:text-red-400 transition-colors pt-1"
                      >
                        Delete workout
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-zinc-500 text-sm">No workouts recorded yet.</p>
      )}
    </div>
  );
}

export function Progress() {
  const [timeRange, setTimeRange] = useState<TimeRange>("month");
  const [selectedDay, setSelectedDay] = useState<1 | 2>(1);

  const sessionHistory = useQuery(api.workouts.getSessionHistory, {
    day: selectedDay,
  });
  const bodyHistory = useQuery(api.bodyMeasurements.getAll);
  const runningHistory = useQuery(api.running.getAll);

  const filterByTimeRange = <T extends object>(
    items: T[] | undefined,
    dateGetter: (item: T) => string | undefined
  ): T[] => {
    if (!items) return [];
    if (timeRange === "all") return items;

    const now = new Date();
    const cutoff = new Date();
    if (timeRange === "week") cutoff.setDate(now.getDate() - 7);
    else cutoff.setMonth(now.getMonth() - 1);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    return items.filter((item) => {
      const d = dateGetter(item);
      return d && d >= cutoffStr;
    });
  };

  const filteredSessions = filterByTimeRange(
    sessionHistory,
    (s) => s.session.date
  );
  const filteredBody = filterByTimeRange(bodyHistory, (b) => b.date);
  const filteredRuns = filterByTimeRange(runningHistory, (r) => r.date);

  // Workout progress: compute max weight per exercise over time
  const exerciseProgress: Record<
    string,
    { latest: number; best: number; sessions: number }
  > = {};
  if (filteredSessions) {
    for (const { logs } of filteredSessions) {
      for (const log of logs) {
        const maxWeight = Math.max(...log.sets.map((s) => s.weight), 0);
        if (!exerciseProgress[log.exerciseName]) {
          exerciseProgress[log.exerciseName] = {
            latest: maxWeight,
            best: maxWeight,
            sessions: 1,
          };
        } else {
          exerciseProgress[log.exerciseName].best = Math.max(
            exerciseProgress[log.exerciseName].best,
            maxWeight
          );
          exerciseProgress[log.exerciseName].sessions++;
          // Latest is the first one (descending order)
        }
      }
    }
  }

  // Body measurement trends
  const bodyTrend =
    filteredBody && filteredBody.length >= 2
      ? {
          latest: filteredBody[0],
          oldest: filteredBody[filteredBody.length - 1],
        }
      : null;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["week", "month", "all"] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              timeRange === range
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {range === "week"
              ? "Week"
              : range === "month"
                ? "Month"
                : "All Time"}
          </button>
        ))}
      </div>

      {/* Workout Progress */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Workout Progress</h3>
          <div className="flex gap-1">
            <button
              onClick={() => setSelectedDay(1)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDay === 1
                  ? "bg-violet-600/30 text-violet-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Day 1
            </button>
            <button
              onClick={() => setSelectedDay(2)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDay === 2
                  ? "bg-violet-600/30 text-violet-300"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Day 2
            </button>
          </div>
        </div>

        {Object.keys(exerciseProgress).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(exerciseProgress).map(([name, data]) => {
              const maxPossible = Math.max(data.best * 1.2, 1);
              return (
                <div key={name}>
                  <ProgressBar
                    label={name}
                    current={data.latest}
                    max={maxPossible}
                  />
                  <div className="flex gap-4 mt-1 text-xs text-zinc-500">
                    <span>Best: {data.best}kg</span>
                    <span>Sessions: {data.sessions}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            No workout data yet. Complete a workout to see progress!
          </p>
        )}
      </div>

      {/* Running Progress */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
        <h3 className="text-white font-medium mb-4">Running Progress</h3>

        {filteredRuns.length > 0 ? (
          <div className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-700/30 rounded-lg p-3 text-center">
                <span className="text-zinc-500 text-xs block mb-1">Total runs</span>
                <span className="text-white text-lg font-semibold">{filteredRuns.length}</span>
              </div>
              <div className="bg-zinc-700/30 rounded-lg p-3 text-center">
                <span className="text-zinc-500 text-xs block mb-1">Total km</span>
                <span className="text-white text-lg font-semibold">
                  {filteredRuns.reduce((sum, r) => sum + r.distance, 0).toFixed(1)}
                </span>
              </div>
              <div className="bg-zinc-700/30 rounded-lg p-3 text-center">
                <span className="text-zinc-500 text-xs block mb-1">Avg HR</span>
                <span className="text-white text-lg font-semibold">
                  {Math.round(filteredRuns.reduce((sum, r) => sum + r.avgHeartRate, 0) / filteredRuns.length)}
                </span>
              </div>
            </div>

            {/* Trend: latest vs oldest */}
            {filteredRuns.length >= 2 && (() => {
              const latest = filteredRuns[0];
              const oldest = filteredRuns[filteredRuns.length - 1];
              const pace = (r: { time: number; distance: number }) =>
                r.distance > 0 ? r.time / r.distance : 0;
              const latestPace = pace(latest);
              const oldestPace = pace(oldest);

              return (
                <div className="space-y-2">
                  {[
                    { label: "Distance", current: latest.distance, previous: oldest.distance, unit: "km", lowerBetter: false },
                    { label: "Time", current: latest.time, previous: oldest.time, unit: "min", lowerBetter: true },
                    { label: "Pace", current: latestPace, previous: oldestPace, unit: "min/km", lowerBetter: true },
                    { label: "Avg HR", current: latest.avgHeartRate, previous: oldest.avgHeartRate, unit: "bpm", lowerBetter: true },
                  ].map(({ label, current, previous, unit, lowerBetter }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
                    >
                      <span className="text-zinc-400 text-sm">{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-white text-sm font-medium">
                          {current % 1 === 0 ? current : current.toFixed(1)} {unit}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            (lowerBetter ? current < previous : current > previous)
                              ? "bg-green-500/20 text-green-400"
                              : current === previous
                                ? "bg-zinc-600/20 text-zinc-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {formatChange(current, previous)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-zinc-500 mt-2">
                    Comparing {latest.date} vs {oldest.date} ({filteredRuns.length} runs)
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            No running data yet. Log a run to see progress!
          </p>
        )}
      </div>

      {/* Body Measurements Progress */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
        <h3 className="text-white font-medium mb-4">
          Body Measurements Trend
        </h3>

        {bodyTrend ? (
          <div className="space-y-3">
            {[
              { key: "weight" as const, label: "Weight", unit: "kg" },
              { key: "chest" as const, label: "Chest", unit: "cm" },
              { key: "waist" as const, label: "Waist", unit: "cm" },
              { key: "hips" as const, label: "Hips", unit: "cm" },
              { key: "bicepLeft" as const, label: "Bicep L", unit: "cm" },
              { key: "bicepRight" as const, label: "Bicep R", unit: "cm" },
              { key: "thighLeft" as const, label: "Thigh L", unit: "cm" },
              { key: "thighRight" as const, label: "Thigh R", unit: "cm" },
            ].map(({ key, label, unit }) => {
              const current = bodyTrend.latest[key];
              const previous = bodyTrend.oldest[key];
              if (current == null) return null;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
                >
                  <span className="text-zinc-400 text-sm">{label}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white text-sm font-medium">
                      {current} {unit}
                    </span>
                    {previous != null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          current < previous
                            ? "bg-green-500/20 text-green-400"
                            : current > previous
                              ? "bg-red-500/20 text-red-400"
                              : "bg-zinc-600/20 text-zinc-400"
                        }`}
                      >
                        {formatChange(current, previous)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="text-xs text-zinc-500 mt-2">
              Comparing {bodyTrend.latest.date} vs {bodyTrend.oldest.date} (
              {filteredBody?.length ?? 0} entries)
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">
            Add at least 2 body measurements to see trends!
          </p>
        )}
      </div>

      {/* Workout History with details & delete */}
      <WorkoutHistory />
    </div>
  );
}
