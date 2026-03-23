import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function RunningTracker() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const latest = useQuery(api.running.getLatest);
  const history = useQuery(api.running.getAll);
  const saveRun = useMutation(api.running.save);

  const handleSave = async () => {
    if (!time || !distance || !heartRate) return;
    setSaving(true);
    try {
      await saveRun({
        date,
        time: Number(time),
        distance: Number(distance),
        avgHeartRate: Number(heartRate),
      });
      setTime("");
      setDistance("");
      setHeartRate("");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
        <label className="text-sm text-zinc-400 block mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Inputs */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50 space-y-3">
        <h3 className="text-white font-medium mb-1">Log your run</h3>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">
            Time (min)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              placeholder={latest?.time?.toString() ?? "30"}
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
            {latest?.time != null && (
              <span className="text-zinc-500 text-xs whitespace-nowrap">
                last: {latest.time}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">
            Distance (km)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              placeholder={latest?.distance?.toString() ?? "5"}
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
            {latest?.distance != null && (
              <span className="text-zinc-500 text-xs whitespace-nowrap">
                last: {latest.distance}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-500 block mb-1">
            Avg heart rate (bpm)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder={latest?.avgHeartRate?.toString() ?? "140"}
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
            />
            {latest?.avgHeartRate != null && (
              <span className="text-zinc-500 text-xs whitespace-nowrap">
                last: {latest.avgHeartRate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving || !time || !distance || !heartRate}
        className={`w-full py-3.5 rounded-xl font-medium transition-all ${
          saved
            ? "bg-green-600 text-white"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25"
        } disabled:opacity-50`}
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save Run"}
      </button>

      {/* History */}
      {history && history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-zinc-400 text-sm font-medium">History</h3>
          {history.slice(0, 10).map((entry) => (
            <div
              key={entry._id}
              className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50"
            >
              <div className="text-zinc-500 text-xs mb-2">{entry.date}</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-zinc-500 text-xs block">Time</span>
                  <span className="text-white">{entry.time} min</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Distance</span>
                  <span className="text-white">{entry.distance} km</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs block">Avg HR</span>
                  <span className="text-white">{entry.avgHeartRate} bpm</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
