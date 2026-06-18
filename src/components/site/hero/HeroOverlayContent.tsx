"use client";
import { useRef } from "react";
import { IndexItem } from "./IndexItem";
import { useProgressEffect } from "./scroll-progress";
import type { Tables } from "@/integrations/supabase/types";

/** Default positions (percentages of the hero canvas) when a project has none saved. */
const SCATTER: { x: number; y: number; rotate: number }[] = [
  { x: 18, y: 22, rotate: -4 },
  { x: 78, y: 26, rotate: 3 },
  { x: 14, y: 58, rotate: 2 },
  { x: 82, y: 64, rotate: -3 },
  { x: 28, y: 80, rotate: 5 },
  { x: 70, y: 82, rotate: -2 },
  { x: 10, y: 42, rotate: 4 },
  { x: 86, y: 46, rotate: -5 },
  { x: 48, y: 12, rotate: 0 },
  { x: 52, y: 88, rotate: 0 },
];

const SOCIAL = [
  { label: "Reach out", href: "#contact" },
  { label: "Github", href: "https://github.com/Susshxx" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sushanta-marahatta" },
  { label: "Whatsapp", href: "https://wa.me/9779826160838" },
];

export function HeroOverlayContent({ projects = [] }: { projects?: Tables<"projects">[] }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLHeadingElement | null>(null);

  const items = projects.map((p, i) => {
    const fallback = SCATTER[i % SCATTER.length];
    const x = p.hero_x != null ? Number(p.hero_x) : fallback.x;
    const y = p.hero_y != null ? Number(p.hero_y) : fallback.y;
    const rotate =
      p.hero_rotate != null ? Number(p.hero_rotate) : fallback.rotate;
    return { label: p.title, slug: p.slug, x, y, rotate };
  });


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
      {items.map((it) => (
        <IndexItem
          key={it.slug ?? it.label}
          label={it.label}
          pos={{ x: it.x, y: it.y }}
          rotate={it.rotate}
          slug={it.slug}
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
