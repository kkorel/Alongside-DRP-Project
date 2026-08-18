import { IconName } from "../components/DesignPrimitives";

// Centralised navigation config for the quiet-space experience.
//
// SIDEBAR_GROUPS drives the left sidebar (one entry per group). Each group's
// default href points at its first sub-tab so clicking the group lands there.
// The *_TABS arrays drive the horizontal sub-tab pill row at the top of each
// group's content area (Draw and Resources are single views, so they have none).

export type NavGroup = {
  href: string; // where the sidebar links (the group's default sub-tab)
  label: string;
  subtitle?: string;
  icon: IconName;
  tone?: "calm" | "warm";
  // Path prefix used to mark the group active (defaults to href).
  match?: string;
  // UX-metrics target id, kept on the relevant nav element.
  metricId?: string;
};

export const SIDEBAR_GROUPS: NavGroup[] = [
  { href: "/dashboard", label: "Home", icon: "home", tone: "warm" },
  {
    href: "/write/free",
    label: "Write",
    subtitle: "freely or with gentle prompts",
    icon: "pen",
    tone: "calm",
    match: "/write",
  },
  {
    href: "/calm/breathe",
    label: "Feel calm",
    subtitle: "breathe, observe & meditate",
    icon: "wind",
    tone: "calm",
    match: "/calm",
  },
  {
    href: "/draw",
    label: "Draw",
    subtitle: "a little space to doodle",
    icon: "brush",
    tone: "calm",
    match: "/draw",
    metricId: "calm-doodle",
  },
  {
    href: "/resources",
    label: "Resources",
    subtitle: "support links to keep",
    icon: "externalLink",
    tone: "calm",
    match: "/resources",
  },
];

// --- Contextual sidebar items (used outside the dashboard) -----------------
//
// The sidebar swaps its main options by zone. In the group room it shows the
// group plus a doorway into the quiet space; in the quiet space it shows a way
// back to the group plus the same four intents the dashboard lists.

// Shown (active) when the visitor is in the group room.
export const GROUP_ITEM: NavGroup = {
  href: "/room",
  label: "The group",
  subtitle: "today's session",
  icon: "people",
  match: "/room",
};

// The doorway from the room into the quiet space. It lands on free writing —
// the "write your thoughts down" default the old in-chat quiet button used.
// A match that never fits a real path keeps it reading as a doorway, not a tab.
export const STEP_INTO_QUIET_ITEM: NavGroup = {
  href: "/write/free",
  label: "Step into the quiet space",
  icon: "quiet",
  tone: "calm",
  match: "/__step-into-quiet",
};

// Shown at the top of the quiet-space sidebar.
export const BACK_TO_GROUP_ITEM: NavGroup = {
  href: "/room",
  label: "Back to group",
  icon: "arrowLeft",
};

// The four intents, reused as the quiet-space sidebar (Write / Feel calm /
// Draw / Resources — everything in SIDEBAR_GROUPS except Home).
export const QUIET_INTENTS: NavGroup[] = SIDEBAR_GROUPS.slice(1);

export type SubTab = {
  href: string;
  label: string;
  metricId?: string;
};

export const WRITE_TABS: SubTab[] = [
  { href: "/write/free", label: "Free writing", metricId: "reflect-free" },
  { href: "/write/guided", label: "Guided questions", metricId: "reflect-guided" },
];

export const CALM_TABS: SubTab[] = [
  { href: "/calm/breathe", label: "Slow Your Breathing", metricId: "calm-breathe" },
  {
    href: "/calm/steady",
    label: "Notice Things Around You",
    metricId: "calm-steady",
  },
  {
    href: "/calm/meditation",
    label: "Guided Meditation",
    metricId: "calm-meditation",
  },
];
