export function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// A gentle "time since" label for a past timestamp ("just now", "3 hours ago",
// "2 days ago", "4 months ago"). Used for onboarding-completed and group-created.
export function formatTimeSince(value: string | null | undefined): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} ${w === 1 ? "week" : "weeks"} ago`;
  }
  if (days < 365) {
    const mo = Math.floor(days / 30);
    return `${mo} ${mo === 1 ? "month" : "months"} ago`;
  }
  const y = Math.floor(days / 365);
  return `${y} ${y === 1 ? "year" : "years"} ago`;
}

// JS Date.getDay() index (Sunday = 0) for each backend DayOfWeek name.
const WEEKDAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// Turn a LocalTime string ("17:00" or "17:00:00") into a gentle label ("5:00 pm").
function formatTimeOfDay(scheduledTime: string): string {
  const [hourPart, minutePart] = scheduledTime.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart ?? "0");
  if (Number.isNaN(hour)) {
    return scheduledTime;
  }
  const period = hour < 12 ? "am" : "pm";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

// Capitalised weekday from the backend's uppercase name ("FRIDAY" → "Friday").
function titleCaseDay(dayOfWeek: string): string {
  return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();
}

// Days from today until the next occurrence of the given weekday (0 = today).
function daysUntilWeekday(weekdayIndex: number, from = new Date()): number {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  return (weekdayIndex - today.getDay() + 7) % 7;
}

// The next calendar date (today or later) that falls on the given weekday.
function nextDateForWeekday(weekdayIndex: number, from = new Date()): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + daysUntilWeekday(weekdayIndex, from));
  return result;
}

// A gentle countdown label for the next session ("today" / "tomorrow" / "in N days").
function relativeDayLabel(daysAway: number): string {
  if (daysAway <= 0) return "today";
  if (daysAway === 1) return "tomorrow";
  return `in ${daysAway} days`;
}

export type SessionSchedule = {
  dayLabel: string; // "Friday"
  dateLabel: string; // "6 June"
  timeLabel: string; // "5:00 pm"
  relative: string; // "in 3 days"
  full: string; // "Friday, 6 June · 5:00 pm"
};

// Build friendly schedule labels for the dashboard "this week" card from the
// DB's dayOfWeek + scheduledTime. Returns null if the data isn't available.
export function formatSessionSchedule(
  dayOfWeek?: string,
  scheduledTime?: string,
  durationMinutes?: number | null,
  // When this week's session has already been held (facilitator closed the
  // room), point everything at next week's occurrence instead of today's.
  forceNextWeek = false,
): SessionSchedule | null {
  if (!dayOfWeek || !scheduledTime) {
    return null;
  }
  const weekdayIndex = WEEKDAY_INDEX[dayOfWeek.toUpperCase()];
  const dayLabel = titleCaseDay(dayOfWeek);
  const timeLabel = formatTimeOfDay(scheduledTime);

  if (weekdayIndex === undefined) {
    return {
      dayLabel,
      dateLabel: "",
      timeLabel,
      relative: "",
      full: `${dayLabel} · ${timeLabel}`,
    };
  }

  let daysAway = daysUntilWeekday(weekdayIndex);

  // If the session day is today but the whole session window (start + duration)
  // has already passed, show next week. During the meeting itself the date
  // stays today's.
  if (daysAway === 0 && scheduledTime) {
    const [hourPart, minutePart] = scheduledTime.split(":");
    const now = new Date();
    const sessionMins = Number(hourPart) * 60 + Number(minutePart ?? "0");
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (nowMins >= sessionMins + (durationMinutes ?? 60)) daysAway = 7;
  }

  // This week's session has already happened — the next one is a week from
  // today's occurrence.
  if (forceNextWeek && daysAway === 0) daysAway = 7;

  const date = nextDateForWeekday(weekdayIndex);
  if (daysAway === 7) date.setDate(date.getDate() + 7);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(date);

  return {
    dayLabel,
    dateLabel,
    timeLabel,
    relative: relativeDayLabel(daysAway),
    full: `${dayLabel}, ${dateLabel} · ${timeLabel}`,
  };
}

// Whether a group's session is happening now ("live") or hasn't started yet today
// ("liveSoon"), derived from the schedule + duration against the current time. Mirrors the
// facilitator's liveStatus — used here only for the dashboard card's badge/labels; actual
// joinability is gated on the backend session flag, not the clock.
export function liveStatus(
  dayOfWeek?: string,
  scheduledTime?: string,
  durationMinutes?: number | null,
  now: Date = new Date(),
): { live: boolean; liveSoon: boolean } {
  if (!dayOfWeek || !scheduledTime) return { live: false, liveSoon: false };
  const idx = WEEKDAY_INDEX[dayOfWeek.toUpperCase()];
  if (idx === undefined || now.getDay() !== idx) return { live: false, liveSoon: false };
  const [hStr, mStr] = scheduledTime.split(":");
  const start = new Date(now);
  start.setHours(Number(hStr), Number(mStr ?? "0"), 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (durationMinutes ?? 60));
  if (now >= start && now < end) return { live: true, liveSoon: false };
  if (now < start) return { live: false, liveSoon: true };
  return { live: false, liveSoon: false };
}

// A gentle day label for message date separators ("Today", "Yesterday",
// "6 June", or "6 June 2025" for older years).
export function dayLabelFor(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const startOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
  };
  const diffDays = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(date);
}

// Whether two timestamps fall on different calendar days — used to decide
// where a date separator goes in a message list.
export function isNewDay(prevIso: string | undefined, iso: string): boolean {
  if (!prevIso) return true;
  const a = new Date(prevIso);
  const b = new Date(iso);
  return (
    a.getFullYear() !== b.getFullYear() ||
    a.getMonth() !== b.getMonth() ||
    a.getDate() !== b.getDate()
  );
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
