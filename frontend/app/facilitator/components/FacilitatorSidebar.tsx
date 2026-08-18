"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { BrandMark, IconName, LineIcon } from "../../components/DesignPrimitives";
import { useWithFid } from "../../lib/identity";
import { apiBase, fetchArrivals } from "../lib/api";
import { POLL_INTERVAL_MS } from "../../lib/pollIntervals";

// The facilitator-side shell. It mirrors the participant SidebarLayout style
// (collapsible "alongside" rail + content area) but with the facilitator's own
// two destinations: Home and Arrivals.

const STORAGE_KEY = "fac.sidebar.collapsed";
const MOBILE_BREAKPOINT = 768;

type FacNavItem = { href: string; label: string; icon: IconName; tone?: "warm" | "calm" };

const NAV: FacNavItem[] = [
  { href: "/facilitator", label: "My groups", icon: "home", tone: "warm" },
  { href: "/facilitator/messages", label: "Messages", icon: "mail", tone: "warm" },
  { href: "/facilitator/arrivals", label: "Arrivals", icon: "people", tone: "warm" },
];

// Arrivals and Messages each own their subtree; Home owns everything else under
// /facilitator (home, groups, room, …) so it stays lit on those pages.
function isActive(pathname: string, href: string): boolean {
  if (href === "/facilitator/arrivals") {
    return pathname.startsWith("/facilitator/arrivals");
  }
  if (href === "/facilitator/messages") {
    return pathname.startsWith("/facilitator/messages");
  }
  return (
    pathname === "/facilitator" ||
    (pathname.startsWith("/facilitator/") &&
      !pathname.startsWith("/facilitator/arrivals") &&
      !pathname.startsWith("/facilitator/messages"))
  );
}

export function FacilitatorSidebar({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const withFid = useWithFid();
  const [collapsed, setCollapsed] = useState(false);
  // How many people are waiting to be placed — shown as a badge on Arrivals.
  const [arrivalsCount, setArrivalsCount] = useState(0);

  // Best-effort, gentle poll. The sidebar also remounts on each navigation, so
  // the count refreshes naturally after a facilitator places someone.
  useEffect(() => {
    let active = true;
    const apiUrl = apiBase();
    const load = () =>
      fetchArrivals(apiUrl)
        .then((arrivals) => {
          if (active) setArrivalsCount(arrivals.length);
        })
        .catch(() => {
          /* keep the last known count */
        });
    const timeoutId = window.setTimeout(load, 0);
    const intervalId = window.setInterval(load, POLL_INTERVAL_MS);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  // Restore saved preference; default to collapsed on narrow screens.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setCollapsed(stored === "true");
      } else if (window.innerWidth < MOBILE_BREAKPOINT) {
        setCollapsed(true);
      }
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="flex h-screen overflow-hidden bg-paper text-ink">
      <aside
        className={`relative flex shrink-0 flex-col bg-paper transition-[width] duration-300 ease-out ${
          collapsed ? "w-[78px]" : "w-60"
        }`}
      >
        {/* dotted divider on the right edge */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 border-r-2 border-dashed border-line"
        />

        {/* collapse / expand toggle, floating on the divider */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-7 z-10 grid h-6 w-6 place-items-center rounded-full border border-line bg-card text-muted shadow-[0_2px_6px_rgba(68,52,35,0.12)] transition hover:text-ink"
        >
          <LineIcon
            name="arrowLeft"
            size={14}
            style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
          />
        </button>

        {/* logo */}
        <div
          className={`flex h-[72px] shrink-0 items-center ${
            collapsed ? "justify-center" : "px-5"
          }`}
        >
          <BrandMark markOnly={collapsed} />
        </div>

        <nav
          aria-label="Primary"
          className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-2"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const count =
              item.href === "/facilitator/arrivals" ? arrivalsCount : 0;
            const badge = count > 9 ? "9+" : String(count);
            return (
              <Link
                key={item.href}
                href={withFid(item.href)}
                aria-current={active ? "page" : undefined}
                aria-label={
                  count > 0
                    ? `${item.label}, ${count} waiting to be placed`
                    : undefined
                }
                title={collapsed ? item.label : undefined}
                className={`nav-link ${item.tone ? item.tone : ""} ${active ? "active" : ""} ${
                  collapsed ? "justify-center" : ""
                }`}
              >
                {/* icon (with a corner bubble when collapsed) */}
                <span className="relative inline-flex shrink-0">
                  <LineIcon name={item.icon} size={22} />
                  {count > 0 && collapsed && (
                    <span
                      aria-hidden="true"
                      className="absolute -right-1.5 -top-1.5 inline-flex items-center justify-center rounded-full text-[10px] font-bold leading-none text-white"
                      style={{
                        minWidth: 16,
                        height: 16,
                        padding: "0 3px",
                        background: "var(--warm)",
                        border: "1.5px solid var(--paper)",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </span>

                {!collapsed && <span className="leading-tight">{item.label}</span>}

                {/* count pill, right-aligned, when expanded */}
                {count > 0 && !collapsed && (
                  <span
                    aria-hidden="true"
                    className="ml-auto inline-flex items-center justify-center rounded-full text-[11px] font-bold leading-none text-white"
                    style={{
                      minWidth: 20,
                      height: 18,
                      padding: "0 6px",
                      background: "var(--warm)",
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Facilitator pages were built to scroll the window (their .stack root
          grows; .scroll has no min-height:0), so this pane owns the scroll. */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
