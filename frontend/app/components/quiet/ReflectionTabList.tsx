import { IconName, LineIcon } from "../DesignPrimitives";

export type ReflectionTab = "calming" | "guided" | "free";

const reflectionTabs: Array<{
  id: ReflectionTab;
  label: string;
  description: string;
  icon: IconName;
}> = [
  {
    id: "calming",
    label: "Calming corner",
    description: "Breathe & settle",
    icon: "wind",
  },
  {
    id: "guided",
    label: "Guided questions",
    description: "Reflect with gentle prompts",
    icon: "heart",
  },
  {
    id: "free",
    label: "Free writing",
    description: "Write freely and privately",
    icon: "pen",
  },
];

export function ReflectionTabList({
  activeTab,
  disabled,
  onTabChange,
}: {
  activeTab: ReflectionTab;
  disabled: boolean;
  onTabChange: (tab: ReflectionTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Reflection type"
      className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:border-r-2 lg:border-dashed lg:border-line lg:pr-3"
    >
      {reflectionTabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? "[border-color:var(--calm)] bg-calm-soft text-calm-ink"
                : "border-transparent bg-transparent text-muted hover:border-line hover:bg-card"
            }`}
          >
            <span
              aria-hidden="true"
              className={`av h-8 w-8 ${isActive ? "calm" : "muted"}`}
            >
              <LineIcon name={tab.icon} size={16} />
            </span>
            <span>
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">
                {tab.description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}