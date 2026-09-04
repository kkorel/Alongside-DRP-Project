"use client";

import { ReactNode } from "react";

import { SidebarLayout } from "../components/SidebarLayout";
import { QuietSpaceProvider } from "../lib/QuietSpaceContext";

// Shared shell for every quiet-space group (/write, /calm, /draw, /resources).
// It mounts the sidebar once and wraps the groups in the shared quiet-space
// context, so reflection state is preserved as the visitor moves between
// groups and sub-tabs. SidebarLayout works out the group-vs-home framing from
// the stored world, so the layout itself stays presentational.
export default function QuietGroupsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarLayout>
      <QuietSpaceProvider>
        <main className="h-full overflow-hidden bg-paper px-4 py-5 text-ink sm:px-6 lg:px-8">
          <section className="panel mx-auto flex h-full min-h-0 max-w-6xl flex-col overflow-hidden shadow-[0_24px_80px_rgba(68,52,35,0.14)]">
            {children}
          </section>
        </main>
      </QuietSpaceProvider>
    </SidebarLayout>
  );
}
