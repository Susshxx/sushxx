"use client";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useProgressEffect } from "./scroll-progress";

type Props = {
  label: string;
  /** Position as percentages of the hero canvas (0..100). */
  pos: { x: number; y: number };
  slug?: string | null;
};

export function IndexItem({ label, pos, slug }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  useProgressEffect((p) => {
    const el = ref.current;
    if (!el) return;
    const conv = Math.min(1, p / 0.85);
    const eased = 1 - Math.pow(1 - conv, 2);
    const x = pos.x + (50 - pos.x) * eased;
    const y = pos.y + (50 - pos.y) * eased;
    const opacity = p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.15) : 1;
    const blur = eased * 6;
    el.style.left = `${x}%`;
    el.style.top = `${y}%`;
    el.style.transform = `translate(-50%, -50%)`;
    el.style.opacity = String(opacity);
    el.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
  });

  const text = (
    <span className="font-display text-fg/90 whitespace-nowrap text-[clamp(0.95rem,1.2vw,1.15rem)] italic tracking-tight">
      {label}
    </span>
  );

  return (
    <div
      ref={ref}
      className="absolute will-change-transform"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: `translate(-50%, -50%)`,
        pointerEvents: slug ? "auto" : "none",
      }}
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
