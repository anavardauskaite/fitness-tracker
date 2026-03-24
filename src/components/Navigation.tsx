type Tab = "workouts" | "running" | "body" | "progress";

const TAB_ICONS: Record<Tab, string> = {
  workouts: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
  running: "M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z",
  body: "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0",
  progress: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
};

function TabIcon({ tab }: { tab: Tab }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={TAB_ICONS[tab]} />
    </svg>
  );
}

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
    <nav className="flex gap-1 bg-zinc-800/40 p-1 rounded-2xl mb-6 border border-zinc-700/30">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === tab.id
              ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/30"
          }`}
        >
          <TabIcon tab={tab.id} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
