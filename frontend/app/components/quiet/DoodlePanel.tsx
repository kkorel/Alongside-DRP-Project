import {
  PointerEvent as ReactPointerEvent,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { fetchDoodles, saveDoodle } from "../../lib/api";
import { Doodle } from "../../lib/types";
import { LineIcon } from "../DesignPrimitives";

// Lets the shell's top-right "Share with facilitator" button share the current
// canvas without the doodle toolbar growing its own share button.
export type DoodleShareHandle = { shareCurrent: () => Promise<void> };

const DOODLE_COLOURS: Array<{ name: string; value: string }> = [
  { name: "Charcoal", value: "#3a4a3a" },
  { name: "Sage", value: "#7e9a78" },
  { name: "Terracotta", value: "#c2693f" },
  { name: "Soft blue", value: "#6f8fa6" },
];

const CARD_FILL = "#fcfaf3"; // warm cream frame
const CANVAS_FILL = "#fffdf8"; // warm off-white drawing surface (not pure white)
const TAN_BORDER = "#e3dac6"; // app's soft tan border
const SAGE = "#7e9a78";
// Selected colour dot: a cream gap then a soft sage ring (no hard border).
const SELECTED_HALO = `0 0 0 3px ${CARD_FILL}, 0 0 0 5px ${SAGE}`;
// Gentle alternating tilt so kept doodles read like a scrapbook wall.
const KEPT_ROTATIONS = ["-3deg", "2.5deg", "-2deg", "3deg"];
const LINE_WIDTH = 3.2;
// The eraser is just a thick stroke in the canvas background colour.
const ERASER_WIDTH = 22;

export function DoodlePanel({
  apiUrl,
  shareRef,
}: {
  apiUrl: string;
  shareRef: RefObject<DoodleShareHandle | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const colourRef = useRef(DOODLE_COLOURS[0].value);
  const [selectedColour, setSelectedColour] = useState(DOODLE_COLOURS[0].value);
  const isErasingRef = useRef(false);
  const [isErasing, setIsErasing] = useState(false);
  const [kept, setKept] = useState<Doodle[]>([]);
  const [justKept, setJustKept] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    colourRef.current = selectedColour;
  }, [selectedColour]);

  useEffect(() => {
    isErasingRef.current = isErasing;
  }, [isErasing]);

  // Size the canvas backing store to its displayed size (× DPR) so strokes are
  // crisp and line up with the cursor, then lay down the warm background.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = LINE_WIDTH;
    ctx.fillStyle = CANVAS_FILL;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctxRef.current = ctx;
  }, []);

  const loadKept = useCallback(async () => {
    try {
      setKept(await fetchDoodles(apiUrl));
    } catch {
      // The collection is best-effort; leave what we have on a failed load.
    }
  }, [apiUrl]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadKept();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadKept]);

  // Expose "share the current canvas" to the shell's top-right Share button.
  useEffect(() => {
    shareRef.current = {
      shareCurrent: async () => {
        const image = canvasRef.current?.toDataURL("image/png");
        if (!image) {
          return;
        }
        await saveDoodle(apiUrl, image, true);
        setJustKept(true);
        await loadKept();
      },
    };

    return () => {
      shareRef.current = null;
    };
  }, [shareRef, apiUrl, loadKept]);

  function pointerPosition(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const ctx = ctxRef.current;
    if (!ctx) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    setJustKept(false);

    const { x, y } = pointerPosition(event);
    if (isErasingRef.current) {
      ctx.strokeStyle = CANVAS_FILL;
      ctx.lineWidth = ERASER_WIDTH;
    } else {
      ctx.strokeStyle = colourRef.current;
      ctx.lineWidth = LINE_WIDTH;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
    // A tap leaves a small dot.
    ctx.lineTo(x + 0.1, y + 0.1);
    ctx.stroke();
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) {
      return;
    }
    const ctx = ctxRef.current;
    if (!ctx) {
      return;
    }

    const { x, y } = pointerPosition(event);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawingRef.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = CANVAS_FILL;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setJustKept(false);
  }

  async function handleKeep() {
    const image = canvasRef.current?.toDataURL("image/png");
    if (!image || isBusy) {
      return;
    }

    setIsBusy(true);
    try {
      await saveDoodle(apiUrl, image, false);
      setJustKept(true);
      await loadKept();
    } catch {
      // Soft-fail: no alarming error state in a calming space.
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div
        className="sk soft p-6"
        style={{ background: CARD_FILL }}
      >
        <div className="text-center">
          <h3 className="h-title text-2xl text-ink">A little space to draw</h3>
          <p className="mx-auto mt-1 max-w-md text-[15px] leading-relaxed text-muted">
            No words needed - there&apos;s nothing to get
            right.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {DOODLE_COLOURS.map((colour) => {
              const isSelected = !isErasing && colour.value === selectedColour;

              return (
                <button
                  key={colour.value}
                  type="button"
                  aria-label={colour.name}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedColour(colour.value);
                    setIsErasing(false);
                  }}
                  className="h-7 w-7 rounded-full transition"
                  style={{
                    background: colour.value,
                    boxShadow: isSelected ? SELECTED_HALO : undefined,
                  }}
                />
              );
            })}

            <button
              type="button"
              aria-label="Eraser"
              aria-pressed={isErasing}
              onClick={() => setIsErasing(true)}
              className={`ml-1 rounded-full p-1 transition ${
                isErasing ? "text-calm-ink" : "text-muted hover:text-ink"
              }`}
            >
              <LineIcon name="eraser" size={24} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={clearCanvas} className="btn ghost sm">
              Clear
            </button>
            <button
              type="button"
              onClick={handleKeep}
              disabled={isBusy}
              className="btn sm"
              style={{ borderColor: SAGE }}
            >
              Keep this
            </button>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          onPointerCancel={stopDrawing}
          className="sk thin mt-4 block h-[360px] w-full lg:h-[460px]"
          style={{
            background: CANVAS_FILL,
            borderColor: TAN_BORDER,
            touchAction: "none",
          }}
        />

        {justKept && (
          <p className="mt-3 text-center text-sm text-calm-ink animate-fadeIn">
            Kept - it&apos;s in your collection below.
          </p>
        )}
      </div>

      {kept.length > 0 && (
        <div>
          <h3 className="scrawl text-2xl text-ink">
            Doodles you&apos;ve kept{" "}
            <span className="text-base text-muted">— only you can see these</span>
          </h3>

          <div className="mt-3 flex flex-wrap justify-center gap-4">
            {kept.map((doodle, index) => (
              <div
                key={doodle.id}
                className="rounded-md border bg-white p-1.5 shadow-sm"
                style={{
                  borderColor: TAN_BORDER,
                  transform: `rotate(${
                    KEPT_ROTATIONS[index % KEPT_ROTATIONS.length]
                  })`,
                }}
              >
                {/* object-contain (not cover) so the whole wide canvas shows in
                    the thumbnail — edge content isn't cropped to look blank. */}
                {/* eslint-disable-next-line @next/next/no-img-element -- a base64 canvas data URL, nothing for next/image to optimise */}
                <img
                  src={doodle.imageData}
                  alt="A doodle you kept"
                  className="h-20 w-40 rounded-sm object-contain"
                  style={{ background: CANVAS_FILL }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}