import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getExercisesForDay, type Exercise } from "../data/exercises";

function getYouTubeEmbedUrl(url: string): string {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([^?&/]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

function VideoModal({
  exercise,
  onClose,
}: {
  exercise: Exercise;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {exercise.name}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>
        {exercise.notes && (
          <p className="text-zinc-400 text-sm mb-4">{exercise.notes}</p>
        )}
        <div className="space-y-4">
          {exercise.videoUrls.map((url, i) => (
            <div key={i}>
              {exercise.videoUrls.length > 1 && (
                <p className="text-zinc-400 text-xs mb-2">Video {i + 1}</p>
              )}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={getYouTubeEmbedUrl(url)}
                  title={`${exercise.name} video ${i + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const REST_DURATION = 90; // seconds

function RestTimer({ onDismiss }: { onDismiss: () => void }) {
  const [seconds, setSeconds] = useState(REST_DURATION);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const pct = (seconds / REST_DURATION) * 100;
  const done = seconds === 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md">
      <div
        className={`rounded-2xl p-4 border shadow-xl backdrop-blur-sm ${
          done
            ? "bg-green-900/90 border-green-700/50"
            : "bg-zinc-800/95 border-zinc-700/50"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-300">
            {done ? "Rest complete!" : "Rest timer"}
          </span>
          <button
            onClick={onDismiss}
            className="text-zinc-400 hover:text-white text-sm px-2 py-0.5 rounded-lg hover:bg-zinc-700/50 transition-colors"
          >
            {done ? "OK" : "Skip"}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-2xl font-mono font-bold tabular-nums ${
              done ? "text-green-400" : seconds <= 10 ? "text-amber-400" : "text-white"
            }`}
          >
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                done
                  ? "bg-green-500"
                  : seconds <= 10
                    ? "bg-amber-500"
                    : "bg-violet-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PRBadge({ type }: { type: "weight" | "reps" }) {
  return (
    <span className="pr-glow inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/15 px-1.5 py-0.5 rounded-full">
      PR {type === "weight" ? "wt" : "reps"}
    </span>
  );
}

interface SetData {
  reps: string;
  weight: string;
}

interface ExerciseFormData {
  sets: SetData[];
}

export function WorkoutTracker() {
  const [day, setDay] = useState<1 | 2>(1);
  const [comment, setComment] = useState("");
  const [videoExercise, setVideoExercise] = useState<Exercise | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [newPRs, setNewPRs] = useState<string[]>([]);

  const exercises = getExercisesForDay(day);
  const latestSession = useQuery(api.workouts.getLatestSession, { day });
  const personalRecords = useQuery(api.workouts.getPersonalRecords, { day });
  const saveWorkout = useMutation(api.workouts.saveWorkout);

  const getLastSets = (exerciseName: string) => {
    if (!latestSession?.logs) return null;
    const log = latestSession.logs.find((l) => l.exerciseName === exerciseName);
    return log?.sets ?? null;
  };

  const [formData, setFormData] = useState<Record<string, ExerciseFormData>>(
    {}
  );

  const getFormData = (exerciseName: string): ExerciseFormData => {
    if (formData[exerciseName]) return formData[exerciseName];
    return { sets: [{ reps: "", weight: "" }, { reps: "", weight: "" }, { reps: "", weight: "" }] };
  };

  const startRestTimer = () => {
    setShowTimer(false);
    setTimeout(() => setShowTimer(true), 50);
  };

  const updateSet = (
    exerciseName: string,
    setIndex: number,
    field: "reps" | "weight",
    value: string
  ) => {
    const current = getFormData(exerciseName);
    const newSets = [...current.sets];
    newSets[setIndex] = { ...newSets[setIndex], [field]: value };
    setFormData((prev) => ({
      ...prev,
      [exerciseName]: { sets: newSets },
    }));
  };

  // Check for PRs in current form data
  const checkPR = (exerciseName: string, setIndex: number): { weight: boolean; reps: boolean } => {
    const pr = personalRecords?.[exerciseName];
    if (!pr) return { weight: false, reps: false };

    const current = getFormData(exerciseName).sets[setIndex];
    const w = Number(current.weight);
    const r = Number(current.reps);

    return {
      weight: w > 0 && w > pr.maxWeight,
      reps: r > 0 && r > pr.maxReps,
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const exerciseEntries = exercises
        .map((ex) => {
          const data = getFormData(ex.name);
          const sets = data.sets
            .filter((s) => s.reps !== "" || s.weight !== "")
            .map((s) => ({
              reps: Number(s.reps) || 0,
              weight: Number(s.weight) || 0,
            }));
          return { exerciseName: ex.name, sets };
        })
        .filter((e) => e.sets.length > 0);

      if (exerciseEntries.length === 0) {
        setSaving(false);
        return;
      }

      // Detect PRs before saving
      const detectedPRs: string[] = [];
      for (const entry of exerciseEntries) {
        const pr = personalRecords?.[entry.exerciseName];
        if (!pr) continue;
        for (const set of entry.sets) {
          if (set.weight > pr.maxWeight || set.reps > pr.maxReps) {
            detectedPRs.push(entry.exerciseName);
            break;
          }
        }
      }
      setNewPRs(detectedPRs);

      await saveWorkout({
        day,
        date: new Date().toISOString().split("T")[0],
        comment: comment || undefined,
        exercises: exerciseEntries,
      });

      setFormData({});
      setComment("");
      setShowTimer(false);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setNewPRs([]);
      }, 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleDayChange = (newDay: 1 | 2) => {
    setDay(newDay);
    setFormData({});
    setComment("");
    setSaved(false);
    setShowTimer(false);
    setNewPRs([]);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => handleDayChange(1)}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            day === 1
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Front
        </button>
        <button
          onClick={() => handleDayChange(2)}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            day === 2
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Back
        </button>
      </div>

      {latestSession?.session && (
        <p className="text-zinc-500 text-sm">
          Last workout: {latestSession.session.date}
        </p>
      )}

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map((exercise) => {
          const lastSets = getLastSets(exercise.name);
          const current = getFormData(exercise.name);
          const pr = personalRecords?.[exercise.name];

          return (
            <div
              key={exercise.name}
              className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50 transition-all hover:border-zinc-600/60 hover:bg-zinc-800/80"
            >
              <button
                onClick={() => setVideoExercise(exercise)}
                className="text-left w-full mb-3 group"
              >
                <h3 className="text-white font-medium group-hover:text-violet-400 transition-colors">
                  {exercise.name}
                  <span className="text-violet-400 text-xs ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    &#9654; video
                  </span>
                </h3>
                {pr && (
                  <p className="text-zinc-500 text-xs mt-1">
                    PR: {pr.maxWeight}kg &middot; {pr.maxReps} reps
                  </p>
                )}
              </button>

              {/* Set inputs with last stats inline */}
              <div className="space-y-2">
                <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs text-zinc-500 px-1">
                  <span className="w-8">Set</span>
                  <span>Reps</span>
                  <span>Weight (kg)</span>
                </div>
                {current.sets.map((set, i) => {
                  const lastReps = lastSets?.[i]?.reps;
                  const lastWeight = lastSets?.[i]?.weight;
                  const prCheck = checkPR(exercise.name, i);
                  return (
                    <div key={i}>
                      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                        <span className="text-zinc-500 text-sm w-8 text-center">
                          {i + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder={lastReps?.toString() ?? "12"}
                            value={set.reps}
                            onChange={(e) =>
                              updateSet(exercise.name, i, "reps", e.target.value)
                            }
                            className={`w-full bg-zinc-700/50 border rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors ${
                              prCheck.reps
                                ? "border-amber-400/70 bg-amber-400/5"
                                : "border-zinc-600/50 focus:border-violet-500/50"
                            }`}
                          />
                          {lastReps != null && (
                            <span className="text-zinc-500 text-xs whitespace-nowrap">
                              {lastReps}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder={lastWeight?.toString() ?? "0"}
                            value={set.weight}
                            onChange={(e) =>
                              updateSet(exercise.name, i, "weight", e.target.value)
                            }
                            className={`w-full bg-zinc-700/50 border rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none transition-colors ${
                              prCheck.weight
                                ? "border-amber-400/70 bg-amber-400/5"
                                : "border-zinc-600/50 focus:border-violet-500/50"
                            }`}
                          />
                          {lastWeight != null && (
                            <span className="text-zinc-500 text-xs whitespace-nowrap">
                              {lastWeight}
                            </span>
                          )}
                        </div>
                      </div>
                      {(prCheck.weight || prCheck.reps) && (
                        <div className="flex gap-1.5 mt-1 ml-10">
                          {prCheck.weight && <PRBadge type="weight" />}
                          {prCheck.reps && <PRBadge type="reps" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comment */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50 transition-all hover:border-zinc-600/60 hover:bg-zinc-800/80">
        <label className="text-sm text-zinc-400 block mb-2">
          Workout notes
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How did it go? Any notes..."
          rows={3}
          className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 resize-none"
        />
      </div>

      {/* PR Summary after save */}
      {saved && newPRs.length > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-4">
          <p className="text-amber-400 font-medium text-sm mb-1">
            New Personal Records!
          </p>
          <div className="flex flex-wrap gap-1.5">
            {newPRs.map((name) => (
              <span
                key={name}
                className="text-xs bg-amber-400/15 text-amber-300 px-2 py-0.5 rounded-full"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-3.5 rounded-xl font-medium transition-all ${
          saved
            ? "bg-green-600 text-white"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
        } disabled:opacity-50`}
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Workout"}
      </button>

      {/* Floating Rest Timer Button + Timer */}
      {showTimer ? (
        <RestTimer onDismiss={() => setShowTimer(false)} />
      ) : (
        <button
          onClick={startRestTimer}
          className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/30 flex items-center justify-center transition-all active:scale-95"
          title="Start rest timer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </button>
      )}

      {/* Video Modal */}
      {videoExercise && (
        <VideoModal
          exercise={videoExercise}
          onClose={() => setVideoExercise(null)}
        />
      )}
    </div>
  );
}
