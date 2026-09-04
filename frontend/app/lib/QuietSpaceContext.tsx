"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";

import { fallbackApiUrl } from "./api";
import { useQuietSpace } from "./useQuietSpace";

type QuietSpaceContextValue = ReturnType<typeof useQuietSpace> & {
  apiUrl: string;
};

const QuietSpaceContext = createContext<QuietSpaceContextValue | null>(null);

export function QuietSpaceProvider({ children }: { children: ReactNode }) {
  const apiUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL ?? fallbackApiUrl;
  }, []);

  const quiet = useQuietSpace(apiUrl);

  const value = useMemo<QuietSpaceContextValue>(
    () => ({ ...quiet, apiUrl }),
    [quiet, apiUrl],
  );

  return (
    <QuietSpaceContext.Provider value={value}>
      {children}
    </QuietSpaceContext.Provider>
  );
}

export function useQuietSpaceContext(): QuietSpaceContextValue {
  const ctx = useContext(QuietSpaceContext);
  if (!ctx) {
    throw new Error(
      "useQuietSpaceContext must be used inside <QuietSpaceProvider>",
    );
  }
  return ctx;
}
