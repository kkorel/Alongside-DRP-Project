import { RefObject } from "react";

import { BreathePanel } from "./BreathePanel";
import { DoodlePanel, DoodleShareHandle } from "./DoodlePanel";
import { MeditationPanel } from "./MeditationPanel";
import { ResourcesPanel } from "./ResourcesPanel";
import { SteadyMePanel } from "./SteadyMePanel";

export type CalmingView =
  | "breathe"
  | "steady"
  | "meditation"
  | "doodle"
  | "resources";

const calmingViews: Array<{ id: CalmingView; label: string }> = [
  { id: "breathe", label: "Slow Your Breathing" },
  { id: "steady", label: "Notice Things Around You" },
  { id: "meditation", label: "Guided Meditation" },
  { id: "doodle", label: "Doodle" },
  { id: "resources", label: "Resources" },
];

export function CalmingCorner({
  apiUrl,
  activeView,
  onActiveViewChange,
  doodleShareRef,
}: {
  apiUrl: string;
  activeView: CalmingView;
  onActiveViewChange: (view: CalmingView) => void;
  doodleShareRef: RefObject<DoodleShareHandle | null>;
}) {
  return (
    <div className="space-y-5">
      <div
        role="tablist"
        aria-label="Calming corner"
        className="flex flex-wrap gap-2"
      >
        {calmingViews.map((view) => {
          const isActive = view.id === activeView;

          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              data-metric-id={`calm-${view.id}`}
              aria-selected={isActive}
              onClick={() => onActiveViewChange(view.id)}
              className={`btn sm ${isActive ? "calm" : "ghost"}`}
            >
              {view.label}
            </button>
          );
        })}
      </div>

      {activeView === "breathe" ? (
        <BreathePanel />
      ) : activeView === "steady" ? (
        <SteadyMePanel />
      ) : activeView === "meditation" ? (
        <MeditationPanel apiUrl={apiUrl} />
      ) : activeView === "doodle" ? (
        <DoodlePanel apiUrl={apiUrl} shareRef={doodleShareRef} />
      ) : (
        <ResourcesPanel apiUrl={apiUrl} />
      )}
    </div>
  );
}