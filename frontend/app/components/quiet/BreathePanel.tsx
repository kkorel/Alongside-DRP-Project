import { useEffect, useState } from "react";

const breathePhases: Array<{ label: string; ms: number }> = [
  { label: "Breathe in", ms: 4000 },
  { label: "Hold", ms: 2000 },
  { label: "Breathe out", ms: 6000 },
  { label: "Rest", ms: 1000 },
];

export function BreathePanel() {
  const [phaseLabel, setPhaseLabel] = useState(breathePhases[0].label);

  // Walk the labels in step with the CSS keyframe; clean up on unmount.
  useEffect(() => {
    let index = 0;
    let timer = 0;

    const advance = () => {
      timer = window.setTimeout(() => {
        index = (index + 1) % breathePhases.length;
        setPhaseLabel(breathePhases[index].label);
        advance();
      }, breathePhases[index].ms);
    };

    advance();

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="sk soft bg-card p-6 text-center sm:p-8">
      <p className="text-[15px] leading-relaxed text-muted">
        Follow the circle if it helps. There&apos;s no rush — let your breath
        find its own pace.
      </p>

      <div className="mt-8 flex items-center justify-center">
        <div className="relative flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 lg:h-96 lg:w-96">
          {/* Filled disc + concentric inner ring scale together with the breath.
             The keyframe's minimum scale keeps the contracted ring wider than the
             label, so the text always sits cleanly inside it. */}
          <span aria-hidden="true" className="breathe-orb absolute inset-0">
            <span className="absolute inset-0 rounded-full bg-calm-soft" />
            <span className="absolute inset-8 rounded-full border-2 [border-color:var(--calm)]" />
          </span>
          {/* Label stays a steady size and sits inside the inner ring. */}
          <span
            aria-live="polite"
            className="scrawl relative px-2 text-3xl font-bold text-calm-ink"
          >
            {phaseLabel}
          </span>
        </div>
      </div>
    </div>
  );
}