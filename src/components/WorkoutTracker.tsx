import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getExercisesForDay, type Exercise } from "../data/exercises";

function getYouTubeEmbedUrl(url: string): string {
  // Handle youtube.com/shorts/ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
  if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  // Handle youtube.com/watch?v=ID
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

  const exercises = getExercisesForDay(day);
  const latestSession = useQuery(api.workouts.getLatestSession, { day });
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

      await saveWorkout({
        day,
        date: new Date().toISOString().split("T")[0],
        comment: comment || undefined,
        exercises: exerciseEntries,
      });

      setFormData({});
      setComment("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDayChange = (newDay: 1 | 2) => {
    setDay(newDay);
    setFormData({});
    setComment("");
    setSaved(false);
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

          return (
            <div
              key={exercise.name}
              className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50"
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
                  return (
                    <div
                      key={i}
                      className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center"
                    >
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
                          className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
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
                          className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
                        />
                        {lastWeight != null && (
                          <span className="text-zinc-500 text-xs whitespace-nowrap">
                            {lastWeight}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comment */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
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
