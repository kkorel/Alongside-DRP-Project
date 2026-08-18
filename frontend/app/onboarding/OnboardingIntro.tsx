"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";

import { BrandMark } from "../components/DesignPrimitives";
import { withPid } from "../lib/identity";
import { Icon, IconName } from "./Icon";

// The opening page of the survey flow: a warm welcome, an upfront "why we ask ·
// how it's used" grid, the gentle "you don't have to answer everything" note,
// and a code of conduct the person actively accepts (read in a popup) before
// beginning. Ported from the design's SurveyIntro (wf-survey.jsx).

// ---- the community guidelines, split by context ----
type Guideline = { icon: IconName; t: string; d: string };

const COC_GROUP: Guideline[] = [
  {
    icon: IconName.Heart,
    t: "Lead with kindness",
    d: "Everyone here is carrying something - be gentle and patient",
  },
  {
    icon: IconName.Shield,
    t: "What’s shared here, stays here",
    d: "Hold each other’s stories in confidence. Nothing from your group meetings should be repeated outside it.",
  },
  {
    icon: IconName.Quiet,
    t: "Share at your own pace",
    d: "Say as much or as little as you like. No one is ever pressed to speak, and silence is welcome.",
  },
  {
    icon: IconName.People,
    t: "Make room for everyone",
    d: "Listen as much as you share. Different beliefs, cultures and ways of grieving all belong here.",
  },
];

const COC_ADVISOR: Guideline[] = [
  {
    icon: IconName.Chat,
    t: "A trained listener, here for you",
    d: "Your facilitator is a real person trained to support you - there to listen, never to judge.",
  },
  {
    icon: IconName.Heart,
    t: "Not an emergency service",
    d: "They can’t offer crisis or medical care. If things feel unsafe, we’ll always point you somewhere that can help right away.",
  },
];

function CocSection({ title, items }: { title: string; items: Guideline[] }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="leader" style={{ color: "var(--warm)", marginBottom: 12 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((g) => (
          <div
            key={g.t}
            style={{ display: "flex", gap: 13, alignItems: "flex-start" }}
          >
            <div
              className="sk thin"
              style={{
                width: 40,
                height: 40,
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--warm-soft)",
                borderColor: "var(--warm)",
                borderRadius: "50% 46% 52% 48%",
              }}
            >
              <Icon name={g.icon} size={21} c="var(--warm)" />
            </div>
            <div style={{ flex: 1 }}>
              <div className="h-title" style={{ fontSize: 19, lineHeight: 1.1 }}>
                {g.t}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "var(--muted)",
                  lineHeight: 1.45,
                  marginTop: 2,
                }}
              >
                {g.d}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// The popup itself — a dimmed backdrop with a hand-drawn card floating over the
// page, matching the survey's PausePopup overlay language.
function CodeOfConductModal({
  onAccept,
  onClose,
}: {
  onAccept: () => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(40, 32, 24, 0.42)",
        backdropFilter: "blur(3px)",
        padding: 28,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sk"
        style={{
          width: 620,
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--card)",
          boxShadow: "0 24px 70px rgba(40, 30, 20, .3)",
        }}
      >
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            padding: "24px 28px 16px",
            borderBottom: "2px dashed var(--line)",
          }}
        >
          <div
            className="sk v2"
            style={{
              width: 46,
              height: 46,
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--calm-soft)",
              borderColor: "var(--calm)",
            }}
          >
            <Icon name={IconName.Book} size={24} c="var(--calm)" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="h-title" style={{ fontSize: 27, lineHeight: 1.05 }}>
              How we look after each other
            </div>
            <div
              style={{
                fontSize: 16,
                color: "var(--muted)",
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              A few small promises everyone keeps, so this stays a safe
              place to be.
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sk thin"
            style={{
              width: 34,
              height: 34,
              flex: "0 0 auto",
              cursor: "pointer",
              background: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderColor: "var(--line)",
            }}
          >
            <Icon name={IconName.X} size={16} c="var(--muted)" />
          </button>
        </div>
        {/* body — scrolls if tall */}
        <div style={{ padding: "20px 28px 8px", overflowY: "auto" }}>
          <CocSection title="In your circle" items={COC_GROUP} />
          <CocSection title="With your wellbeing advisor" items={COC_ADVISOR} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: "12px 14px",
              marginTop: 4,
              marginBottom: 16,
              background: "var(--calm-soft)",
              border: "1.6px solid var(--calm)",
              borderRadius: "16px 230px 16px 240px/230px 16px 240px 16px",
            }}
          >
            <Icon name={IconName.Heart} size={20} c="var(--calm)" />
            <span style={{ fontSize: 15.5, color: "var(--calm-ink)", lineHeight: 1.4 }}>
              If you ever feel unsafe or overwhelmed, you can leave a conversation at any time -
              we’ll always show you where to find urgent help.
            </span>
          </div>
        </div>
        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 28px",
            borderTop: "2px dashed var(--line)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn ghost"
            style={{ fontSize: 15 }}
          >
            Close
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={onAccept}
            className="btn warm"
            style={{ fontSize: 15.5 }}
          >
            I understand &amp; agree <Icon name={IconName.Check} size={16} c="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

// One "why we ask" reason on the opening page.
function WhyPoint({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
      <div
        className="sk thin"
        style={{
          width: 42,
          height: 42,
          flex: "0 0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--card)",
          borderColor: "var(--line)",
          borderRadius: "52% 48% 50% 50%",
        }}
      >
        <Icon name={icon} size={22} c="var(--warm)" />
      </div>
      <div style={{ flex: 1 }}>
        <div className="h-title" style={{ fontSize: 19.5, lineHeight: 1.1 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "var(--muted)",
            lineHeight: 1.45,
            marginTop: 2,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function OnboardingIntro() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [modal, setModal] = useState(false);

  return (
    <div style={{ position: "relative", height: "100%" }}>
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "var(--paper)",
        }}
      >
        {/* header — matches the onboarding survey's top band */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "18px 30px",
            borderBottom: "2px solid var(--line)",
          }}
        >
          <BrandMark small />
          <span className="h-title" style={{ fontSize: 18, color: "var(--muted)" }}>
            · Setting up your space
          </span>
          <div style={{ flex: 1 }} />
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "30px 44px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            {/* welcome */}
            <div
              className="scrawl"
              style={{ fontSize: 22, color: "var(--warm)", lineHeight: 1 }}
            >
              Welcome to alongside
            </div>
            <div
              className="h-title"
              style={{ fontSize: 40, lineHeight: 1.06, margin: "8px 0 10px" }}
            >
              Let’s find the people who’ll <span className="uline">understand</span>.
            </div>
            <p
              style={{
                fontSize: 17.5,
                color: "var(--ink)",
                lineHeight: 1.5,
                margin: "0 0 26px",
                maxWidth: 640,
              }}
            >
              Before you step in, a few questions help us shape this around
              you. There’s no rush, you can skip most of the questions, and you can pause whenever
              you need to.
            </p>

            {/* why we ask */}
            <div className="sk v3" style={{ padding: "22px 26px", marginBottom: 22 }}>
              <div
                className="leader"
                style={{ color: "var(--muted)", marginBottom: 18 }}
              >
                Why we ask · and how it’s used
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px 30px",
                }}
              >
                <WhyPoint icon={IconName.People} title="To introduce you well">
                  We use your answers to place you with a small group
                  who’ve been through something similar.
                </WhyPoint>
                <WhyPoint icon={IconName.Heart} title="So we can support you">
                  Your facilitator sees what you’re comfortable sharing, so
                  they know how to be there for you.
                </WhyPoint>
                <WhyPoint icon={IconName.Shield} title="You stay in control">
                  You don&apos;t have to answer every question. This isn&apos;t a
                  test, feel free to skip some of the questions.
                </WhyPoint>
                <WhyPoint icon={IconName.Quiet} title="At your own pace">
                  It takes about five minutes - but you can stop after the basics
                  and come back to finish the rest whenever you’re ready.
                </WhyPoint>
              </div>
            </div>

            {/* the gentle 'optional' reassurance */}
            <div
              className="whyask"
              style={{ maxWidth: "none", marginBottom: 26, fontSize: 16.5 }}
            >
              <span className="wbar" />
              <span>
                <b>You don’t have to answer everything.</b> Skip anything that
                doesn’t feel right - it won’t hold anything up. The more you feel
                able to share, the more likely we are to match you with people who
                truly understand, but only ever share what feels okay.
              </span>
            </div>

            {/* code of conduct acceptance */}
            <div
              className="sk"
              style={{
                padding: "18px 22px",
                display: "flex",
                alignItems: "center",
                gap: 15,
                background: agreed ? "var(--warm-soft)" : "var(--card)",
                borderColor: agreed ? "var(--warm)" : "var(--ink)",
              }}
            >
              <button
                type="button"
                onClick={() => setAgreed((v) => !v)}
                aria-pressed={agreed}
                aria-label="I agree to the community guidelines"
                className="opt single"
                style={{
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                  flex: "0 0 auto",
                  border: "none",
                  width: "auto",
                }}
              >
                <span
                  className="ind"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    borderColor: agreed ? "var(--warm)" : "var(--line)",
                    background: agreed ? "var(--warm)" : "transparent",
                  }}
                >
                  {agreed && <Icon name={IconName.Check} size={15} c="#fff" sw={2.6} />}
                </span>
              </button>
              <div
                style={{
                  flex: 1,
                  fontSize: 16.5,
                  color: "var(--ink)",
                  lineHeight: 1.4,
                }}
              >
                I’ve read and agree to the{" "}
                <span
                  onClick={() => setModal(true)}
                  style={{
                    cursor: "pointer",
                    color: "var(--warm-ink)",
                    textDecoration: "underline",
                    textDecorationStyle: "wavy",
                    textUnderlineOffset: 3,
                  }}
                >
                  community guidelines
                </span>{" "}
                - how we keep this a safe, warm place.
              </div>
              <button
                type="button"
                onClick={() => setModal(true)}
                className="btn ghost"
                style={{ fontSize: 14.5, flex: "0 0 auto" }}
              >
                <Icon name={IconName.Book} size={16} c="var(--muted)" /> Read them
              </button>
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "16px 44px",
            borderTop: "1.5px solid var(--line)",
          }}
        >
          <div style={{ flex: 1 }} />
          <button
            type="button"
            className="btn warm"
            disabled={!agreed}
            onClick={() => router.push(withPid("/onboarding"))}
            style={{
              fontSize: 16.5,
              opacity: agreed ? 1 : 0.42,
              cursor: agreed ? "pointer" : "not-allowed",
              filter: agreed ? "none" : "grayscale(0.3)",
            }}
          >
            Begin <Icon name={IconName.Chev} size={16} c="#fff" />
          </button>
        </div>
      </div>

      {modal && (
        <CodeOfConductModal
          onClose={() => setModal(false)}
          onAccept={() => {
            setAgreed(true);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}
