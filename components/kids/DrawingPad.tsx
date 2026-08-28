"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUiLang } from "@/components/i18n/LanguageProvider";

/**
 * A drawing canvas.
 *
 * Entirely local: nothing is uploaded, and the only way a picture leaves the
 * device is the child pressing Save, which downloads a PNG. Pointer events
 * cover mouse, touch and stylus with one code path.
 */
const COLORS = [
  "#1f2933", "#e02f2f", "#f08c00", "#f5c518",
  "#2f9e44", "#1c7ed6", "#7048e8", "#ffffff",
];
const SIZES = [4, 10, 20];

export function DrawingPad() {
  const { t } = useUiLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0]!);
  const [size, setSize] = useState(SIZES[1]!);

  const resetCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(ratio, ratio);
    resetCanvas();
  }, [resetCanvas]);

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const { x, y } = point(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(event);
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => {
    drawing.current = false;
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "reddivaripalli-drawing.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="drawpad">
      <div className="drawpad-tools">
        <div className="drawpad-colors" role="group" aria-label={t("kids.draw.colour")}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`drawpad-swatch${color === c ? " is-active" : ""}`}
              style={{ background: c }}
              aria-pressed={color === c}
              aria-label={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="drawpad-sizes" role="group" aria-label={t("kids.draw.size")}>
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-chip${size === s ? " is-active" : ""}`}
              aria-pressed={size === s}
              onClick={() => setSize(s)}
            >
              <span className="drawpad-dot" style={{ width: s, height: s }} aria-hidden />
              <span className="sr-only">{s}</span>
            </button>
          ))}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="drawpad-canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        aria-label={t("kids.draw.canvas")}
        role="img"
      />

      <div className="drawpad-actions">
        <button type="button" className="btn ghost" onClick={resetCanvas}>
          {t("kids.draw.clear")}
        </button>
        <button type="button" className="btn" onClick={save}>
          {t("kids.draw.save")}
        </button>
      </div>
      <p className="muted drawpad-note">{t("kids.draw.note")}</p>
    </div>
  );
}
