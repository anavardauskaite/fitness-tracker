import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const MEASUREMENT_FIELDS = [
  { key: "weight", label: "Weight (kg)" },
  { key: "chest", label: "Chest (cm)" },
  { key: "waist", label: "Waist (cm)" },
  { key: "hips", label: "Hips (cm)" },
  { key: "bicepLeft", label: "Bicep L (cm)" },
  { key: "bicepRight", label: "Bicep R (cm)" },
  { key: "thighLeft", label: "Thigh L (cm)" },
  { key: "thighRight", label: "Thigh R (cm)" },
] as const;

type FieldKey = (typeof MEASUREMENT_FIELDS)[number]["key"];

export function BodyTracker() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [values, setValues] = useState<Record<FieldKey, string>>(
    Object.fromEntries(MEASUREMENT_FIELDS.map((f) => [f.key, ""])) as Record<
      FieldKey,
      string
    >
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const latest = useQuery(api.bodyMeasurements.getLatest);
  const history = useQuery(api.bodyMeasurements.getAll);
  const saveMeasurement = useMutation(api.bodyMeasurements.save);

  const handleSave = async () => {
    setSaving(true);
    try {
      const args: Record<string, string | number | undefined> = { date };
      for (const field of MEASUREMENT_FIELDS) {
        const val = values[field.key];
        if (val !== "") {
          args[field.key] = Number(val);
        }
      }
      await saveMeasurement(args as Parameters<typeof saveMeasurement>[0]);
      setValues(
        Object.fromEntries(
          MEASUREMENT_FIELDS.map((f) => [f.key, ""])
        ) as Record<FieldKey, string>
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Picker */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
        <label className="text-sm text-zinc-400 block mb-2">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50"
        />
      </div>

      {/* Measurement Inputs */}
      <div className="bg-zinc-800/60 rounded-xl p-4 border border-zinc-700/50">
        <h3 className="text-white font-medium mb-4">Measurements</h3>
        <div className="grid grid-cols-2 gap-3">
          {MEASUREMENT_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-xs text-zinc-500 block mb-1">
                {field.label}
              </label>
              <input
                type="number"
                step="0.1"
                placeholder={
                  latest?.[field.key]?.toString() ?? ""
                }
                value={values[field.key]}
                onChange={(e) =>
                  setValues((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full bg-zinc-700/50 border border-zinc-600/50 rounded-lg px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50"
              />
            </div>
          ))}
        </div>
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
        {saving ? "Saving..." : saved ? "Saved!" : "Save Measurements"}
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {MEASUREMENT_FIELDS.map(
                  (field) =>
                    entry[field.key] != null && (
                      <div key={field.key} className="flex justify-between">
                        <span className="text-zinc-400">{field.label}:</span>
                        <span className="text-white">{entry[field.key]}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
