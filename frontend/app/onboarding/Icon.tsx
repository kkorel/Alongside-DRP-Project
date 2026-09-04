import type { CSSProperties, JSX } from "react";

// Minimal line-icon set ported from the design's wf-shared.jsx — only the icons
// the onboarding flow actually uses.
export enum IconName {
  Check = "check",
  Chev = "chev",
  Heart = "heart",
  People = "people",
  Quiet = "quiet",
  Clock = "clock",
  Mug = "mug",
  Bookmark = "bookmark",
  X = "x",
  Shield = "shield",
  Book = "book",
  Chat = "chat",
}

type IconProps = {
  name: IconName;
  size?: number;
  c?: string;
  sw?: number;
  style?: CSSProperties;
};

export function Icon({
  name,
  size = 20,
  c = "currentColor",
  sw = 1.8,
  style,
}: IconProps) {
  const p = {
    fill: "none",
    stroke: c,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, JSX.Element> = {
    [IconName.Chev]: <path {...p} d="M8 4l5 6-5 6" />,
    [IconName.Check]: <path {...p} d="M4 11l5 5 9-11" />,
    [IconName.Heart]: (
      <path
        {...p}
        d="M11 18S3.5 13 3.5 8.2A3.7 3.7 0 0 1 11 6a3.7 3.7 0 0 1 7.5 2.2C18.5 13 11 18 11 18Z"
      />
    ),
    [IconName.People]: (
      <>
        <circle {...p} cx="8" cy="8" r="3" />
        <path {...p} d="M2.5 18c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path {...p} d="M15 6.2a3 3 0 0 1 0 5.6M16 13.5c2.4.5 4 2.4 4 4.5" />
      </>
    ),
    [IconName.Quiet]: (
      <>
        <circle {...p} cx="11" cy="11" r="3" />
        <circle {...p} cx="11" cy="11" r="6.5" opacity="0.6" />
        <circle {...p} cx="11" cy="11" r="9.5" opacity="0.3" />
      </>
    ),
    [IconName.Clock]: (
      <>
        <circle {...p} cx="11" cy="11" r="8" />
        <path {...p} d="M11 6.5V11l3 2" />
      </>
    ),
    [IconName.Mug]: (
      <>
        <path {...p} d="M5 8h11v5a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4z" />
        <path {...p} d="M16 9.5h1.5a2 2 0 0 1 0 4H16" />
        <path {...p} d="M8 3.2v2M11.5 3.2v2" />
      </>
    ),
    [IconName.Bookmark]: <path {...p} d="M6 3.5h10v15l-5-3.6-5 3.6z" />,
    [IconName.X]: <path {...p} d="M5 5l12 12M17 5L5 17" />,
    [IconName.Shield]: (
      <>
        <path {...p} d="M11 2.5l7 2.5v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5z" />
        <path {...p} d="M8 11l2.2 2.2L15 8.5" />
      </>
    ),
    [IconName.Book]: (
      <>
        <path
          {...p}
          d="M11 5.5C9.5 4 6.5 3.5 4 4v12c2.5-.5 5.5 0 7 1.5 1.5-1.5 4.5-2 7-1.5V4c-2.5-.5-5.5 0-7 1.5z"
        />
        <path {...p} d="M11 5.5v12" />
      </>
    ),
    [IconName.Chat]: (
      <>
        <path
          {...p}
          d="M3.5 5.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3.5V14.5a2 2 0 0 1-.5-1.3z"
        />
        <path {...p} d="M7 8h8M7 11h5" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      style={{ display: "block", flex: "0 0 auto", ...style }}
    >
      {paths[name]}
    </svg>
  );
}
