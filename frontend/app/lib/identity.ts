// Who is using the app right now. There is no auth in this prototype: the control
// panel at "/" lets you "become" any participant or facilitator from the database,
// and the chosen identity is carried in the URL query string — `?pid=<id>` for a
// participant, `?fid=<id>` for a facilitator. No browser storage is used, so the
// only way to switch user is to go back to the control panel and pick again.
//
// The control panel enters each side with a full page load, so these values are
// resolved fresh from the URL on every entry; threading the id through in-app links
// (see withPid / withFid) keeps it in the URL so a refresh keeps you as the same person.

import { useSyncExternalStore } from "react";

// Seeded fallbacks, matching the old hardcoded ids, so the app still works if you
// land on a page without an id (e.g. opening a deep link directly).
const FALLBACK_PARTICIPANT_ID = 1;
const FALLBACK_FACILITATOR_ID = 8;

function readId(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = new URLSearchParams(window.location.search).get(key);
  const value = raw ? Number(raw) : NaN;
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export function currentParticipantId(): number {
  return readId("pid", FALLBACK_PARTICIPANT_ID);
}

export function currentFacilitatorId(): number {
  return readId("fid", FALLBACK_FACILITATOR_ID);
}

// Append the current identity to an in-app href so navigation keeps the chosen
// person in the URL. Leaves the id off external/hash-only links and never adds a
// duplicate if the href already carries the key.
function withId(href: string, key: string, id: number): string {
  if (/^[a-z]+:|^\/\//i.test(href)) return href; // external (http:, mailto:, //…)
  const [path, hash] = href.split("#");
  if (new RegExp(`[?&]${key}=`).test(path)) return href;
  const separator = path.includes("?") ? "&" : "?";
  const withParam = `${path}${separator}${key}=${id}`;
  return hash !== undefined ? `${withParam}#${hash}` : withParam;
}

export function withPid(href: string): string {
  return withId(href, "pid", currentParticipantId());
}

export function withFid(href: string): string {
  return withId(href, "fid", currentFacilitatorId());
}

// For hrefs rendered during SSR (e.g. sidebar <Link>s): the id can only be read from
// the URL on the client, so appending it during render would differ from the
// server-rendered markup and trip a hydration mismatch. These hooks return the bare
// href until mounted, then the id-carrying one — matching the codebase's pattern of
// deferring window/storage reads to effects. Use plain withPid/withFid in event
// handlers (router.push), which already run on the client.
// False during SSR and the hydration render (matching the server markup), true once
// running on the client — without a setState-in-effect.
const noop = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function useWithPid(): (href: string) => string {
  const mounted = useMounted();
  return (href: string) => (mounted ? withPid(href) : href);
}

export function useWithFid(): (href: string) => string {
  const mounted = useMounted();
  return (href: string) => (mounted ? withFid(href) : href);
}
