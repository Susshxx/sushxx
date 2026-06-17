"use client";
import { useRef } from "react";
import { IndexItem } from "./IndexItem";
import { useProgressEffect } from "./scroll-progress";

const ITEMS: { label: string; x: number; y: number; rotate?: number }[] = [
  { label: "Aurora OS", x: -30, y: -28, rotate: -4 },
  { label: "Field Notes", x: 28, y: -22, rotate: 3 },
  { label: "Lumen Studio", x: -34, y: 12, rotate: 2 },
  { label: "Northwind", x: 32, y: 18, rotate: -3 },
  { label: "Fjord & Loom", x: -18, y: 30, rotate: 5 },
  { label: "Brand systems", x: 20, y: 32, rotate: -2 },
  { label: "Motion library", x: -38, y: -8, rotate: 4 },
  { label: "Case studies", x: 36, y: -2, rotate: -5 },
  { label: "Generative UI", x: 0, y: -34, rotate: 0 },
  { label: "Prototyping", x: 0, y: 36, rotate: 0 },
];

const SOCIAL = [
  { label: "Reach out", href: "#" },
  { label: "Github", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Whatsapp", href: "#" },
];

export function HeroOverlayContent() {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLHeadingElement | null>(null);

  useProgressEffect((p) => {
    // Fade everything (except the canvas) toward the end of the scrub.
    const overlayOpacity = p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.15) : 1;
    if (overlayRef.current) overlayRef.current.style.opacity = String(overlayOpacity);

    // Wordmark grows slightly + drifts up as eyes open.
    if (wordmarkRef.current) {
      const scale = 1 + p * 0.06;
      const ty = -p * 8;
      wordmarkRef.current.style.transform = `translate3d(-50%, calc(-50% + ${ty}px), 0) scale(${scale})`;
    }
  });

  return (
    <div ref={overlayRef} className="absolute inset-0 z-10 transition-opacity">
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-muted text-xs uppercase tracking-[0.18em]">
          Designing. Building. Shipping
        </span>
        <span className="text-muted text-xs uppercase tracking-[0.18em]">© 2026</span>
      </div>

      {/* Centered logotype */}
      <h1
        ref={wordmarkRef}
        className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(5rem,18vw,16rem)] font-light italic leading-none text-fg will-change-transform"
      >
        Sush
      </h1>

      {/* Scattered index entries */}
      {ITEMS.map((it) => (
        <IndexItem
          key={it.label}
          label={it.label}
          scatter={{ x: it.x, y: it.y }}
          rotate={it.rotate}
        />
      ))}

      {/* Bottom bar — socials */}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-6 py-5 text-sm sm:px-10">
        <span className="text-muted text-xs uppercase tracking-[0.18em]">
          Scroll to open
        </span>
        <nav className="flex flex-wrap gap-4 sm:gap-6">
          {SOCIAL.map((s) => (
            <a
              key={s.label}
              href={s.href}
              className="text-fg/80 hover:text-fg underline-offset-4 transition-colors hover:underline"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
