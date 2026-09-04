"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useWithPid } from "../../lib/identity";
import { SubTab } from "../../lib/nav";

// The horizontal sub-tab pill row shown at the top of a group's content area.
// Same pill styling as the Calming corner (filled `calm` when active, `ghost`
// when inactive) but each pill is a Link, so sub-tabs are deep-linkable and
// back-button friendly.
export function GroupTabs({
  tabs,
  ariaLabel,
}: {
  tabs: SubTab[];
  ariaLabel: string;
}) {
  const pathname = usePathname();
  const withPid = useWithPid();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-wrap gap-2"
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={withPid(tab.href)}
            role="tab"
            aria-selected={isActive}
            data-metric-id={tab.metricId}
            className={`btn sm ${isActive ? "calm" : "ghost"}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
