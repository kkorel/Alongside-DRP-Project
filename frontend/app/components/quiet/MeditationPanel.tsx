import { useCallback, useEffect, useState } from "react";

import { fetchMeditationPlaylists } from "../../lib/api";
import { MeditationPlaylist } from "../../lib/types";
import { LineIcon, SpotifyLogo } from "../DesignPrimitives";

const SPOTIFY_GREEN = "#00ce7c";

function isSpotifyPlaylistUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "open.spotify.com" &&
      parsed.pathname.startsWith("/playlist/")
    );
  } catch {
    return false;
  }
}

export function MeditationPanel({ apiUrl }: { apiUrl: string }) {
  const [playlists, setPlaylists] = useState<MeditationPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadPlaylists = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const result = await fetchMeditationPlaylists(apiUrl);
      // Re-check client-side that we only ever link to Spotify playlist URLs.
      setPlaylists(
        result.filter((playlist) => isSpotifyPlaylistUrl(playlist.spotifyUrl)),
      );
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPlaylists();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPlaylists]);

  if (isLoading) {
    return (
      <div className="sk thin soft bg-paper p-6 text-center text-[15px] text-muted">
        Finding calming playlists…
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="sk thin soft bg-paper p-6 text-center">
        <p className="text-[15px] leading-relaxed text-muted">
          We couldn&apos;t load the playlists just now. 
        </p>
        <button
          type="button"
          onClick={() => void loadPlaylists()}
          className="btn sm mt-4"
        >
          Try again
        </button>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="sk thin soft dash bg-paper p-6 text-center text-[15px] leading-relaxed text-muted">
        Your facilitator hasn&apos;t added any playlists yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[15px] leading-relaxed text-muted">
        A few calming playlists to rest with.
      </p>

      <div className="space-y-3">
        {playlists.map((playlist) => {
          const meta = [
            playlist.description,
            playlist.trackCount != null ? `${playlist.trackCount} tracks` : null,
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <a
              key={playlist.spotifyUrl}
              href={playlist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sk thin soft flex items-center gap-3 bg-card p-4 transition hover:[border-color:var(--calm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-calm"
            >
              <SpotifyLogo size={36} className="shrink-0" />

              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink">
                  {playlist.title}
                </span>
                {meta && (
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">
                    {meta}
                  </span>
                )}
              </span>

              <span
                aria-hidden="true"
                className="btn sm inline-flex shrink-0 items-center gap-1.5"
                style={{
                  background: SPOTIFY_GREEN,
                  borderColor: "transparent",
                  color: "#fff",
                }}
              >
                Open
                <LineIcon name="externalLink" size={15} />
              </span>
            </a>
          );
        })}
      </div>

      <p className="text-center text-xs leading-relaxed text-muted">
        These open in Spotify. You can come back later at any time.
      </p>
    </div>
  );
}