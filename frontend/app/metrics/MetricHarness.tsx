"use client";

// Client-side UX-metrics harness for the Support Access Success study.
//
// It wraps the whole app (mounted in the root layout) and, while a task is
// running, passively logs every click and route change so the behavioural
// metrics — time to access, click count, backtracks, success — are captured
// automatically. The facilitator only ever does two judgement-free things:
// pick the next task, and (rarely) mark "gave up". The participant self-reports
// the two 1–5 ratings at the end of each task.
//
// It is inert until a facilitator opens the control panel (Ctrl/Cmd+Shift+K).
// Disable entirely for a normal build with NEXT_PUBLIC_METRICS=off.

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  ClickEvent,
  METRIC_TASKS,
  MetricTask,
  SCENARIO,
  START_ROUTE,
  TaskResult,
} from "./config";

const STORAGE_KEY = "metric.sessions.v1";
const META_KEY = "metric.meta.v1";

type Phase = "idle" | "briefing" | "card" | "running" | "rating";

// --- persistence helpers ---------------------------------------------------

function loadResults(): TaskResult[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TaskResult[]) : [];
  } catch {
    return [];
  }
}

function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function download(filename: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: TaskResult[]): string {
  const headers = [
    "participant",
    "iteration",
    "taskId",
    "taskLabel",
    "success",
    "gaveUp",
    "startedAt",
    "durationMs",
    "durationSec",
    "clickCount",
    "backtrackCount",
    "knewWhereToGo",
    "feltManageable",
    "note",
  ];
  const lines = rows.map((r) =>
    [
      r.participant,
      r.iteration,
      r.taskId,
      r.taskLabel,
      r.success,
      r.gaveUp,
      r.startedAt,
      r.durationMs,
      (r.durationMs / 1000).toFixed(1),
      r.clickCount,
      r.backtrackCount,
      r.knewWhereToGo ?? "",
      r.feltManageable ?? "",
      r.note,
    ]
      .map(csvCell)
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

// Backtracks: clicks on back/leave/return/close controls, plus route revisits.
// The full click stream is kept in the JSON export so this can be recomputed.
function countBacktracks(clicks: ClickEvent[]): number {
  let bt = 0;
  const seenRoutes = new Set<string>();
  for (const c of clicks) {
    if (/back|leave|return|close|exit/i.test(c.label)) bt++;
    if (seenRoutes.has(c.route)) bt++;
    else seenRoutes.add(c.route);
  }
  return bt;
}

// A 1–5 rating row. Module-level so it isn't recreated each render.
function RatingScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mt-2 flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`av h-11 w-11 ${value === n ? "calm" : "muted"}`}
          aria-pressed={value === n}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

// --- component -------------------------------------------------------------

export function MetricHarness() {
  // A build-time constant, so this early return never changes hook order.
  if (process.env.NEXT_PUBLIC_METRICS === "off") return null;
  return <MetricHarnessInner />;
}

function MetricHarnessInner() {
  const router = useRouter();
  const pathname = usePathname();

  const [panelOpen, setPanelOpen] = useState(false);
  const [participant, setParticipant] = useState("");
  const [iteration, setIteration] = useState("baseline");
  const [phase, setPhase] = useState<Phase>("idle");
  const [task, setTask] = useState<MetricTask | null>(null);
  const [results, setResults] = useState<TaskResult[]>([]);

  // Rating form
  const [knew, setKnew] = useState<number | null>(null);
  const [manageable, setManageable] = useState<number | null>(null);
  const [note, setNote] = useState("");

  // Refs read inside the always-on listeners (avoid stale closures).
  const phaseRef = useRef(phase);
  const taskRef = useRef<MetricTask | null>(null);
  const clicksRef = useRef<ClickEvent[]>([]);
  const startPerfRef = useRef(0);
  const endPerfRef = useRef(0);
  const startedAtRef = useRef("");
  const outcomeRef = useRef<{ success: boolean; gaveUp: boolean }>({
    success: false,
    gaveUp: false,
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Load prior results + facilitator meta once. Deferred so it doesn't setState
  // synchronously inside the effect body (matches the dashboard's load pattern).
  useEffect(() => {
    const id = window.setTimeout(() => {
      setResults(loadResults());
      try {
        const meta = window.localStorage.getItem(META_KEY);
        if (meta) {
          const m = JSON.parse(meta) as {
            participant?: string;
            iteration?: string;
          };
          if (m.participant) setParticipant(m.participant);
          if (m.iteration) setIteration(m.iteration);
        }
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  // Persist meta so a refresh mid-session keeps participant/iteration.
  useEffect(() => {
    try {
      window.localStorage.setItem(META_KEY, JSON.stringify({ participant, iteration }));
    } catch {
      /* ignore */
    }
  }, [participant, iteration]);

  const reachTarget = useCallback(() => {
    endPerfRef.current = performance.now();
    outcomeRef.current = { success: true, gaveUp: false };
    setPhase("rating");
  }, []);

  // Passive global click logger — capture phase, never preventDefault, so the
  // app behaves exactly as normal. Only records while a task is running.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (phaseRef.current !== "running") return;
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.(
        "[data-metric-id], a, button, [role='tab'], [role='button']",
      ) as HTMLElement | null;
      const metricId = el?.getAttribute("data-metric-id") ?? null;
      const label =
        metricId ??
        el?.getAttribute("aria-label") ??
        el?.textContent?.trim().slice(0, 40) ??
        el?.tagName?.toLowerCase() ??
        "?";
      const current = taskRef.current;
      const isTarget = !!(
        current &&
        metricId &&
        current.target.metricIds?.includes(metricId)
      );
      clicksRef.current.push({
        t: Math.round(performance.now() - startPerfRef.current),
        label,
        metricId,
        route: window.location.pathname,
        isTarget,
      });
      if (isTarget) reachTarget();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reachTarget]);

  // Route-based targets (e.g. join group -> "/", quiet room -> "/quiet").
  useEffect(() => {
    if (phase !== "running") return;
    const current = taskRef.current;
    if (current?.target.routes?.includes(pathname)) reachTarget();
  }, [pathname, phase, reachTarget]);

  // Facilitator toggle.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPanelOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const startTask = useCallback(
    (t: MetricTask) => {
      taskRef.current = t;
      clicksRef.current = [];
      outcomeRef.current = { success: false, gaveUp: false };
      setTask(t);
      setKnew(null);
      setManageable(null);
      setNote("");
      router.push(START_ROUTE); // reset to the dashboard landing
      setPhase("card");
    },
    [router],
  );

  const beginTiming = useCallback(() => {
    startPerfRef.current = performance.now();
    startedAtRef.current = new Date().toISOString();
    setPanelOpen(false); // get the facilitator panel out of the way during the task
    setPhase("running");
  }, []);

  const markGaveUp = useCallback(() => {
    endPerfRef.current = performance.now();
    outcomeRef.current = { success: false, gaveUp: true };
    setPhase("rating");
  }, []);

  const saveResult = useCallback(() => {
    const current = taskRef.current;
    if (!current) return;
    const clicks = clicksRef.current;
    const result: TaskResult = {
      participant: participant || "P?",
      iteration,
      taskId: current.id,
      taskLabel: current.label,
      success: outcomeRef.current.success,
      gaveUp: outcomeRef.current.gaveUp,
      startedAt: startedAtRef.current,
      durationMs: Math.round(endPerfRef.current - startPerfRef.current),
      clickCount: clicks.length,
      backtrackCount: countBacktracks(clicks),
      knewWhereToGo: knew,
      feltManageable: manageable,
      note: note.trim(),
      clicks,
    };
    setResults((prev) => {
      const next = [...prev, result];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
    taskRef.current = null;
    setTask(null);
    setPhase("idle");
    setPanelOpen(true); // bring the panel back so the facilitator can pick the next task
  }, [participant, iteration, knew, manageable, note]);

  const completedIds = new Set(
    results.filter((r) => r.iteration === iteration).map((r) => r.taskId),
  );

  // Panel labels: the practice task shows as "Practice"; measured tasks are
  // numbered 1..n so their names don't tip off a watching participant.
  const taskDisplay: string[] = [];
  let taskNumber = 0;
  for (const t of METRIC_TASKS) {
    taskDisplay.push(t.isPractice ? "Practice" : `Task ${(taskNumber += 1)}`);
  }

  // --- participant-facing overlays -----------------------------------------

  const overlayBase =
    "fixed inset-0 z-[9998] flex items-center justify-center bg-paper/95 p-6 animate-fadeIn";

  if (phase === "briefing") {
    return (
      <div className={overlayBase}>
        <div className="sk v2 max-w-xl bg-card px-8 py-9 text-center">
          <p className="leader [color:var(--calm)]">Before we start</p>
          <p className="mt-4 text-[19px] leading-relaxed text-ink">{SCENARIO}</p>
          <button
            type="button"
            className="btn calm mt-8"
            onClick={() => setPhase("idle")}
          >
            I&apos;m ready
          </button>
        </div>
      </div>
    );
  }

  if (phase === "card" && task) {
    return (
      <div className={overlayBase}>
        <div className="sk max-w-xl bg-card px-8 py-9 text-center">
          <p className="leader">Task</p>
          <p className="mt-4 text-[19px] leading-relaxed text-ink">{task.prompt}</p>
          <button type="button" className="btn warm mt-8" onClick={beginTiming}>
            Start
          </button>
          <p className="mt-4 text-xs text-faint">
            There are no wrong answers — explore however feels natural.
          </p>
        </div>
      </div>
    );
  }

  if (phase === "rating") {
    return (
      <div className={overlayBase}>
        <div className="sk v3 w-full max-w-md bg-card px-8 py-8">
          <p className="leader [color:var(--calm)] text-center">Just two quick things</p>
          <div className="mt-6">
            <p className="text-center text-[16px] text-ink">“I knew where to go.”</p>
            <RatingScale value={knew} onChange={setKnew} />
            <p className="mt-1 flex justify-between px-1 text-[11px] text-faint">
              <span>Not at all</span>
              <span>Completely</span>
            </p>
          </div>
          <div className="mt-6">
            <p className="text-center text-[16px] text-ink">“This felt manageable.”</p>
            <RatingScale value={manageable} onChange={setManageable} />
            <p className="mt-1 flex justify-between px-1 text-[11px] text-faint">
              <span>Overwhelming</span>
              <span>Very manageable</span>
            </p>
          </div>
          <textarea
            className="field mt-6"
            rows={2}
            placeholder="Anything feel like too much, or unclear? (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button
            type="button"
            className="btn calm mt-6 w-full"
            disabled={knew === null || manageable === null}
            onClick={saveResult}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // --- facilitator panel + recording indicator -----------------------------

  return (
    <>
      {phase === "running" && (
        <div className="fixed bottom-3 left-3 z-[9997] flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          rec
        </div>
      )}

      {panelOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 rounded-xl border border-slate-700 bg-slate-900 p-4 font-sans text-[13px] text-slate-100 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="font-bold tracking-wide">UX metrics</span>
            <button
              type="button"
              className="text-slate-400 hover:text-white"
              onClick={() => setPanelOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <label className="flex-1">
              <span className="text-[11px] text-slate-400">Participant</span>
              <input
                className="mt-0.5 w-full rounded border border-slate-600 bg-slate-800 px-2 py-1"
                value={participant}
                onChange={(e) => setParticipant(e.target.value)}
                placeholder="P1"
              />
            </label>
            <label className="flex-1">
              <span className="text-[11px] text-slate-400">Iteration</span>
              <input
                className="mt-0.5 w-full rounded border border-slate-600 bg-slate-800 px-2 py-1"
                value={iteration}
                onChange={(e) => setIteration(e.target.value)}
                placeholder="baseline"
              />
            </label>
          </div>

          <button
            type="button"
            className="mt-3 w-full rounded bg-slate-700 py-1.5 font-semibold hover:bg-slate-600"
            onClick={() => setPhase("briefing")}
          >
            Show scenario briefing
          </button>

          {phase === "running" ? (
            <button
              type="button"
              className="mt-3 w-full rounded bg-amber-600 py-1.5 font-semibold hover:bg-amber-500"
              onClick={markGaveUp}
            >
              Mark “gave up / needed help”
            </button>
          ) : (
            <div className="mt-3 max-h-52 space-y-1 overflow-y-auto">
              {METRIC_TASKS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className="flex w-full items-center justify-between rounded border border-slate-700 px-2 py-1.5 text-left hover:bg-slate-800"
                  onClick={() => startTask(t)}
                >
                  <span>{taskDisplay[i]}</span>
                  {completedIds.has(t.id) && (
                    <span className="text-[11px] text-emerald-400">done</span>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3">
            <span className="text-[11px] text-slate-400">
              {results.length} record{results.length === 1 ? "" : "s"}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                className="rounded bg-slate-700 px-2 py-1 text-[11px] hover:bg-slate-600"
                onClick={() => download("metrics.csv", toCsv(results), "text/csv")}
                disabled={results.length === 0}
              >
                CSV
              </button>
              <button
                type="button"
                className="rounded bg-slate-700 px-2 py-1 text-[11px] hover:bg-slate-600"
                onClick={() =>
                  download(
                    "metrics.json",
                    JSON.stringify(results, null, 2),
                    "application/json",
                  )
                }
                disabled={results.length === 0}
              >
                JSON
              </button>
              <button
                type="button"
                className="rounded bg-red-900 px-2 py-1 text-[11px] text-red-200 hover:bg-red-800"
                onClick={() => {
                  if (!window.confirm("Clear all recorded metric data?")) return;
                  window.localStorage.removeItem(STORAGE_KEY);
                  setResults([]);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
