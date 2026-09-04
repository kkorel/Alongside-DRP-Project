// UX-metrics study config — Support Access Success.
//
// Theme: can a bereaved young adult find the right kind of support without
// feeling lost, pressured, or overwhelmed? This file defines the (de-leaked)
// scenario, the per-task prompts, and the "target" that counts as success so
// the harness can time and score each task automatically.
//
// Sample design: 5 fresh participants per iteration (between-subjects), so
// there are no learning effects to counterbalance across designs. Tasks within
// a single session should still be order-rotated by the facilitator.

// Where each task begins. Participants are sent here before timing starts so
// every task is measured from the same dashboard landing.
export const START_ROUTE = "/dashboard";

// Shown once at the start of a session. Deliberately neutral: it does NOT
// enumerate the support options (that would turn findability into
// label-matching) and does NOT plant the overwhelm outcome.
export const SCENARIO =
  "You're on your way home. A peer-support group you signed up for starts " +
  "soon. You open the app to see what's there before the session.";

// A task is "reached" when the participant either lands on one of `routes`
// or clicks an element tagged with one of `metricIds` (via data-metric-id).
export type TaskTarget = {
  metricIds?: string[];
  routes?: string[];
};

export type MetricTask = {
  id: string;
  // Short facilitator-facing label (also the CSV row label).
  label: string;
  // Participant-facing prompt. Phrased as a need/feeling, not the feature name.
  prompt: string;
  target: TaskTarget;
  // A warm-up to teach people the format before the measured tasks. Shown as
  // "Practice" (not numbered) in the panel; safe to ignore in analysis.
  isPractice?: boolean;
};

// The full task bank. The facilitator picks which to run per iteration and in
// what order — not every task suits every iteration's layout.
export const METRIC_TASKS: MetricTask[] = [
  {
    id: "practice-weather",
    label: "Practice — weather check-in",
    prompt:
      "This first one is just practice, so you get a feel for how this works. " +
      "On the screen in front of you, choose the weather that's closest to how " +
      "you're feeling right now. There are no right answers — take your time.",
    target: { metricIds: ["weather-checkin"] },
    isPractice: true,
  },
  {
    id: "message-facilitator",
    label: "Message facilitator",
    prompt:
      "Something has come up that you would rather not share with the whole " +
      "group. You would like a private way to reach someone who can support " +
      "you. Show me what you would do.",
    target: {
      metricIds: ["message-facilitator"],
      routes: ["/message-facilitator"],
    },
  },
  {
    id: "free-writing",
    label: "Free writing",
    prompt:
      "You have a lot in your head, but you do not really want advice, " +
      "questions, or suggestions right now. You just want somewhere to put " +
      "things down in your own way in your own order. Show me what you would " +
      "do.",
    target: { metricIds: ["reflect-free"], routes: ["/write/free"] },
  },
  {
    id: "calming-exercise",
    label: "Calming exercise (Notice Things Around You)",
    prompt:
      "You feel a bit overwhelmed and want something simple that helps you " +
      "focus on what you can notice around you, without needing to write, " +
      "draw or speak. Show me what you would do.",
    target: { metricIds: ["calm-steady"], routes: ["/calm/steady"] },
  },
  {
    id: "doodling",
    label: "Doodling",
    prompt:
      "You do not feel like putting your thoughts into words right now. Since " +
      "you usually enjoy art and creative things, you want a simple, " +
      "low-pressure way to express something without having to explain it. " +
      "Show me what you would do.",
    target: { metricIds: ["calm-doodle"], routes: ["/draw"] },
  },
];

// A single logged interaction during a running task.
export type ClickEvent = {
  t: number; // ms since timing started
  label: string; // data-metric-id, else aria-label, else trimmed text
  metricId: string | null;
  route: string;
  isTarget: boolean;
};

// One completed task attempt — the row that lands in the export.
export type TaskResult = {
  participant: string;
  iteration: string;
  taskId: string;
  taskLabel: string;
  success: boolean;
  gaveUp: boolean;
  startedAt: string; // ISO
  durationMs: number;
  clickCount: number;
  backtrackCount: number;
  knewWhereToGo: number | null; // 1–5
  feltManageable: number | null; // 1–5
  note: string;
  clicks: ClickEvent[];
};
