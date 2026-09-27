export type DriverTab =
  | "requests"
  | "pool"
  | "history";

interface DriverTabsProps {
  activeTab: DriverTab;
  onChange: (tab: DriverTab) => void;
}

const tabs: {
  id: DriverTab;
  label: string;
}[] = [
  {
    id: "requests",
    label: "Requests",
  },
  {
    id: "pool",
    label: "Current Pool",
  },
  {
    id: "history",
    label: "History",
  },
];

export default function DriverTabs({
  activeTab,
  onChange,
}: DriverTabsProps) {
  return (
    <div className="border-b border-gray-200">
      <div className="flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative whitespace-nowrap pb-3 text-sm font-semibold transition ${
                active
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}

              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-black" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}