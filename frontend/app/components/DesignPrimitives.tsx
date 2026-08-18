import { CSSProperties, ReactNode } from "react";

export type IconName =
  | "arrowLeft"
  | "brush"
  | "check"
  | "clock"
  | "close"
  | "eraser"
  | "externalLink"
  | "heart"
  | "home"
  | "mail"
  | "people"
  | "pen"
  | "quiet"
  | "send"
  | "user"
  | "wind";

type LineIconProps = {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function LineIcon({
  name,
  size = 20,
  className,
  style,
}: LineIconProps) {
  const pathProps = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  const paths: Record<IconName, ReactNode> = {
    arrowLeft: <path {...pathProps} d="M13 5 7 11l6 6M7 11h11" />,
    brush: (
      <>
        <path {...pathProps} d="M17 3.5c1 1 .8 3.6-2 6.4L9.9 15l-3-3 5.1-5.1c2.8-2.8 5.4-3 6.4-2Z" />
        <path {...pathProps} d="M9.9 15c-.5 1.8-2.3 3-4.2 2.6-1.2-.3-2.1-1.5-1.5-2.8.4-.9 1.2-1.5 2.2-1.7L9.9 15Z" />
      </>
    ),
    check: <path {...pathProps} d="M4 11l5 5 9-11" />,
    clock: (
      <>
        <circle {...pathProps} cx="11" cy="11" r="8" />
        <path {...pathProps} d="M11 6.5V11l3 2" />
      </>
    ),
    close: <path {...pathProps} d="M5 5l12 12M17 5 5 17" />,
    eraser: (
      <>
        <path
          {...pathProps}
          d="M8.5 17 4.8 13.3a1.6 1.6 0 0 1 0-2.3l6.2-6.2a1.6 1.6 0 0 1 2.3 0l3.7 3.7a1.6 1.6 0 0 1 0 2.3L12.5 17H8.5Z"
        />
        <path {...pathProps} d="M9 8.5 13.5 13M8.5 17H18" />
      </>
    ),
    externalLink: (
      <>
        <path
          {...pathProps}
          d="M16 12.5V17a1.8 1.8 0 0 1-1.8 1.8H5A1.8 1.8 0 0 1 3.2 17V7.8A1.8 1.8 0 0 1 5 6h4.5"
        />
        <path {...pathProps} d="M12.5 4H18v5.5M18 4l-7.5 7.5" />
      </>
    ),
    heart: (
      <path
        {...pathProps}
        d="M11 18S3.5 13 3.5 8.2A3.7 3.7 0 0 1 11 6a3.7 3.7 0 0 1 7.5 2.2C18.5 13 11 18 11 18Z"
      />
    ),
    home: (
      <>
        <path {...pathProps} d="M3.5 10.5 11 4l7.5 6.5" />
        <path
          {...pathProps}
          d="M5.5 9.7V17a1 1 0 0 0 1 1H9v-4.6h4V18h2.5a1 1 0 0 0 1-1V9.7"
        />
      </>
    ),
    mail: (
      <>
        <rect {...pathProps} x="3" y="5" width="16" height="12" rx="2.5" />
        <path {...pathProps} d="M4 7l7 5 7-5" />
      </>
    ),
    people: (
      <>
        <circle {...pathProps} cx="8" cy="8" r="3" />
        <path {...pathProps} d="M2.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path {...pathProps} d="M15 6.2a3 3 0 0 1 0 5.6M16 13.5c2.4.5 4 2.4 4 4.5" />
      </>
    ),
    pen: <path {...pathProps} d="M4 18l1-3.5L14 5.5l3 3L8 17.5 4 18ZM12 7.5l3 3" />,
    quiet: (
      <>
        <circle {...pathProps} cx="11" cy="11" r="3" />
        <circle {...pathProps} cx="11" cy="11" r="6.5" opacity="0.55" />
        <circle {...pathProps} cx="11" cy="11" r="9.5" opacity="0.28" />
      </>
    ),
    send: <path {...pathProps} d="M4 11 18 4l-5 14-2.5-5.5L4 11Zm6.5 1.5L18 4" />,
    user: (
      <>
        <circle {...pathProps} cx="11" cy="8" r="3.2" />
        <path {...pathProps} d="M5 18a6 6 0 0 1 12 0" />
      </>
    ),
    wind: (
      <>
        <path {...pathProps} d="M3 8h9a2.4 2.4 0 1 0-2.4-2.4" />
        <path {...pathProps} d="M3 12h13a2.4 2.4 0 1 1-2.4 2.4" />
        <path {...pathProps} d="M3 16h6.5a2.1 2.1 0 1 1-2.1 2.1" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      style={style}
      viewBox="0 0 22 22"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

// Official Spotify icon — must be used as-is (unaltered colour and shape) to
// comply with Spotify's trademark/brand guidelines. Do not redraw or recolour.
export function SpotifyLogo({
  size = 36,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      role="img"
      aria-label="Spotify"
      className={className}
      height={size}
      style={style}
      viewBox="0 0 236.05 225.25"
      width={size}
    >
      <path
        fill="#00ce7c"
        d="m122.37,3.31C61.99.91,11.1,47.91,8.71,108.29c-2.4,60.38,44.61,111.26,104.98,113.66,60.38,2.4,111.26-44.6,113.66-104.98C229.74,56.59,182.74,5.7,122.37,3.31Zm46.18,160.28c-1.36,2.4-4.01,3.6-6.59,3.24-.79-.11-1.58-.37-2.32-.79-14.46-8.23-30.22-13.59-46.84-15.93-16.62-2.34-33.25-1.53-49.42,2.4-3.51.85-7.04-1.3-7.89-4.81-.85-3.51,1.3-7.04,4.81-7.89,17.78-4.32,36.06-5.21,54.32-2.64,18.26,2.57,35.58,8.46,51.49,17.51,3.13,1.79,4.23,5.77,2.45,8.91Zm14.38-28.72c-2.23,4.12-7.39,5.66-11.51,3.43-16.92-9.15-35.24-15.16-54.45-17.86-19.21-2.7-38.47-1.97-57.26,2.16-1.02.22-2.03.26-3.01.12-3.41-.48-6.33-3.02-7.11-6.59-1.01-4.58,1.89-9.11,6.47-10.12,20.77-4.57,42.06-5.38,63.28-2.4,21.21,2.98,41.46,9.62,60.16,19.74,4.13,2.23,5.66,7.38,3.43,11.51Zm15.94-32.38c-2.1,4.04-6.47,6.13-10.73,5.53-1.15-.16-2.28-.52-3.37-1.08-19.7-10.25-40.92-17.02-63.07-20.13-22.15-3.11-44.42-2.45-66.18,1.97-5.66,1.15-11.17-2.51-12.32-8.16-1.15-5.66,2.51-11.17,8.16-12.32,24.1-4.89,48.74-5.62,73.25-2.18,24.51,3.44,47.99,10.94,69.81,22.29,5.12,2.66,7.11,8.97,4.45,14.09Z"
      />
    </svg>
  );
}

export function BrandMark({
  small = false,
  markOnly = false,
}: {
  small?: boolean;
  // Render just the concentric-circle mark, no wordmark — used by the
  // collapsed sidebar rail.
  markOnly?: boolean;
}) {
  const ring = small ? "h-6 w-6" : "h-8 w-8";

  return (
    <div className="flex items-center gap-2.5">
      <span className={`relative ${ring} shrink-0 rounded-full border-2 border-[var(--ink)]`}>
        <span className="absolute inset-1 rounded-full border border-[var(--warm)]" />
        <span className="absolute inset-[9px] rounded-full bg-[var(--warm)]" />
      </span>
      {!markOnly && (
        <span className={`h-title text-[var(--ink)] ${small ? "text-xl" : "text-2xl"}`}>
          alongside
        </span>
      )}
    </div>
  );
}

export function AvatarCircle({
  initials,
  tone = "warm",
  sizeClass = "h-10 w-10 text-sm",
  className = "",
}: {
  initials: string;
  tone?: "warm" | "calm" | "muted";
  sizeClass?: string;
  className?: string;
}) {
  const toneClass = tone === "calm" ? "calm" : tone === "muted" ? "muted" : "";

  return (
    <span className={`av ${toneClass} ${sizeClass} ${className}`}>
      {initials}
    </span>
  );
}
