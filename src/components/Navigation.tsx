type Tab = "workouts" | "running" | "body" | "progress";

export function Navigation({
  activeTab,
  onTabChange,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "workouts", label: "Workouts" },
    { id: "running", label: "Running" },
    { id: "body", label: "Body" },
    { id: "progress", label: "Progress" },
  ];

  return (
    <nav className="flex gap-1 bg-zinc-800/50 p-1 rounded-xl mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-violet-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
