"use client";
import { useEffect, useRef } from "react";
import { useProgressEffect } from "./scroll-progress";
import { useFramePreloader } from "./use-frame-preloader";
import frames from "@/assets/frames/frames.json";

const FRAME_URLS: string[] = frames as string[];
const LAST = FRAME_URLS.length - 1;

export function HeroFrameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const indexRef = useRef(0);
  const lastDrawnRef = useRef(-1);
  const cache = useFramePreloader(FRAME_URLS, indexRef);

  // Eagerly preload frame 0 and 84 so first paint is instant.
  useEffect(() => {
    [0, LAST].forEach((i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = FRAME_URLS[i];
    });
  }, []);

  // Resize canvas for DPR.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.round(clientWidth * dpr);
      canvas.height = Math.round(clientHeight * dpr);
      lastDrawnRef.current = -1; // force redraw
      requestAnimationFrame(drawCurrent);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawCurrent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const i = indexRef.current;
    if (i === lastDrawnRef.current) return;
    const img = cache.current.get(i);
    if (!img || !img.complete || img.naturalWidth === 0) {
      // try again next frame once it loads
      requestAnimationFrame(drawCurrent);
      return;
    }
    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    // contain
    const ir = img.naturalWidth / img.naturalHeight;
    const cr = cw / ch;
    let dw: number, dh: number, dx: number, dy: number;
    if (ir > cr) {
      dh = ch;
      dw = ch * ir;
      dx = (cw - dw) / 2;
      dy = 0;
    } else {
      dw = cw;
      dh = cw / ir;
      dx = 0;
      dy = (ch - dh) / 2;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
    lastDrawnRef.current = i;
  };

  useProgressEffect((p) => {
    const idx = Math.round(p * LAST);
    if (idx !== indexRef.current) {
      indexRef.current = idx;
      requestAnimationFrame(drawCurrent);
    }
  });

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
