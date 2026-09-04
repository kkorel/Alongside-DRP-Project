import type { Metadata } from "next";
import { Patrick_Hand, Caveat } from "next/font/google";
import "./onboarding.css";

const patrickHand = Patrick_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-scrawl",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Setting up your space",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`onboarding-root ${patrickHand.variable} ${caveat.variable}`}
      style={{ height: "100dvh", overflow: "hidden" }}
    >
      {children}
    </div>
  );
}
