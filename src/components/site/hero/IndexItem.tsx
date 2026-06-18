"use client";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useProgressEffect } from "./scroll-progress";

type Props = {
  label: string;
  scatter: { x: number; y: number };
  rotate?: number;
  slug?: string | null;
};

export function IndexItem({ label, scatter, rotate = 0, slug }: Props) {
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

  const text = (
    <span className="font-display text-fg/90 text-[clamp(0.95rem,1.2vw,1.15rem)] italic tracking-tight">
      {label}
    </span>
  );

  return (
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
      style={{ pointerEvents: slug ? "auto" : "none" }}
    >
      {slug ? (
        <Link
          to="/projects/$slug"
          params={{ slug }}
          className="hover:text-fg cursor-pointer underline-offset-4 transition-all hover:underline"
        >
          {text}
        </Link>
      ) : (
        text
      )}
    </div>
  );
}
