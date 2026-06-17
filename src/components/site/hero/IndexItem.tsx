"use client";
import { useEffect, useRef } from "react";
import { useProgressEffect } from "./scroll-progress";

type Props = {
  label: string;
  scatter: { x: number; y: number }; // viewport % offset from center
  rotate?: number;
};

/** Lerps from a scattered offset to dead-center as scrub progresses 0 → 0.85, then fades out 0.85 → 1. */
export function IndexItem({ label, scatter, rotate = 0 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useProgressEffect((p) => {
    const el = ref.current;
    if (!el) return;
    const conv = Math.min(1, p / 0.85);
    const eased = 1 - Math.pow(1 - conv, 2);
    const x = scatter.x * (1 - eased);
    const y = scatter.y * (1 - eased);
    const rot = rotate * (1 - eased);
    const opacity = p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.15) : 1;
    const blur = eased * 6;
    el.style.transform = `translate3d(${x}vw, ${y}vh, 0) rotate(${rot}deg)`;
    el.style.opacity = String(opacity);
    el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
  });

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
    >
      <span className="font-display text-fg/90 text-[clamp(0.95rem,1.2vw,1.15rem)] italic tracking-tight">
        {label}
      </span>
    </div>
  );
}
