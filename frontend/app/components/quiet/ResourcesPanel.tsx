import { useCallback, useEffect, useState } from "react";

import { fetchSupportLinks } from "../../lib/api";
import { SupportLink } from "../../lib/types";
import { LineIcon } from "../DesignPrimitives";

function isHttpUrl(url: string) {
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function ResourcesPanel({ apiUrl }: { apiUrl: string }) {
  const [links, setLinks] = useState<SupportLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadLinks = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await fetchSupportLinks(apiUrl);
      // Re-check client-side that we only ever render http(s) links.
      setLinks(result.filter((link) => isHttpUrl(link.url)));
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLinks();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadLinks]);

  if (isLoading) {
    return (
      <div className="sk thin soft bg-paper p-6 text-center text-[15px] text-muted">
        Gathering what your facilitator has shared…
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="sk thin soft bg-paper p-6 text-center">
        <p className="text-[15px] leading-relaxed text-muted">
          We couldn&apos;t load the resources just now.
        </p>
        <button
          type="button"
          onClick={() => void loadLinks()}
          className="btn sm mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="sk thin soft dash bg-paper p-6 text-center text-[15px] leading-relaxed text-muted">
        There is nothing here yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sk thin soft block bg-card p-4 transition hover:[border-color:var(--calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm"
        >
          <span className="flex items-start justify-between gap-3">
            <span className="text-[15px] font-semibold text-ink">
              {link.title}
            </span>
            <LineIcon
              name="externalLink"
              size={16}
              className="mt-0.5 shrink-0 text-muted"
            />
          </span>
          {link.description && (
            <span className="mt-1 block text-sm leading-relaxed text-muted">
              {link.description}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}