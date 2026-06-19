"use client";
import { useEffect, useRef, useState } from "react";
import { IndexItem } from "./IndexItem";
import { useProgressEffect } from "./scroll-progress";
import type { Tables } from "@/integrations/supabase/types";
import type { HeroSettings } from "@/lib/settings.functions";

const SCATTER_DESKTOP: { x: number; y: number }[] = [
  { x: 18, y: 22 },
  { x: 78, y: 26 },
  { x: 14, y: 58 },
  { x: 82, y: 64 },
  { x: 28, y: 80 },
  { x: 70, y: 82 },
  { x: 10, y: 42 },
  { x: 86, y: 46 },
  { x: 48, y: 12 },
  { x: 52, y: 88 },
];

const SCATTER_MOBILE: { x: number; y: number }[] = [
  { x: 25, y: 22 },
  { x: 75, y: 28 },
  { x: 20, y: 70 },
  { x: 80, y: 76 },
  { x: 50, y: 14 },
  { x: 50, y: 86 },
  { x: 18, y: 46 },
  { x: 82, y: 52 },
  { x: 30, y: 60 },
  { x: 70, y: 64 },
];

const SOCIAL = [
  { label: "Reach out", href: "#contact" },
  { label: "Github", href: "https://github.com/Susshxx" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/sushanta-marahatta" },
  { label: "Whatsapp", href: "https://wa.me/9779826160838" },
];

function useIsMobileQuery() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function HeroOverlayContent({
  projects = [],
  hero,
}: {
  projects?: Tables<"projects">[];
  hero?: HeroSettings;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const wordmarkRef = useRef<HTMLHeadingElement | null>(null);
  const isMobile = useIsMobileQuery();

  const wordmark = hero?.wordmark ?? "Sush";
  const sizeVw = isMobile ? (hero?.size_mobile ?? 28) : (hero?.size_desktop ?? 18);
  const scatter = isMobile ? SCATTER_MOBILE : SCATTER_DESKTOP;

  const items = projects.map((p, i) => {
    const fb = scatter[i % scatter.length];
    const x = isMobile
      ? p.hero_mobile_x != null
        ? Number(p.hero_mobile_x)
        : p.hero_x != null
          ? Number(p.hero_x)
          : fb.x
      : p.hero_x != null
        ? Number(p.hero_x)
        : fb.x;
    const y = isMobile
      ? p.hero_mobile_y != null
        ? Number(p.hero_mobile_y)
        : p.hero_y != null
          ? Number(p.hero_y)
          : fb.y
      : p.hero_y != null
        ? Number(p.hero_y)
        : fb.y;
    return { label: p.title, slug: p.slug, x, y };
  });

  useProgressEffect((p) => {
    const overlayOpacity = p > 0.85 ? Math.max(0, 1 - (p - 0.85) / 0.15) : 1;
    if (overlayRef.current) overlayRef.current.style.opacity = String(overlayOpacity);
    if (wordmarkRef.current) {
      const scale = 1 + p * 0.06;
      const ty = -p * 8;
      wordmarkRef.current.style.transform = `translate3d(-50%, calc(-50% + ${ty}px), 0) scale(${scale})`;
    }
  });

  return (
    <div ref={overlayRef} className="absolute inset-0 z-10 transition-opacity">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-10 sm:py-5">
        <span className="text-muted text-[10px] uppercase tracking-[0.18em] sm:text-xs">
          Designing. Building. Shipping
        </span>
        <span className="text-muted text-[10px] uppercase tracking-[0.18em] sm:text-xs">
          © 2026
        </span>
      </div>

      <h1
        ref={wordmarkRef}
        className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-light italic leading-none text-fg will-change-transform"
        style={{ fontSize: `${sizeVw}vw` }}
      >
        {wordmark}
      </h1>

      {items.map((it) => (
        <IndexItem
          key={it.slug ?? it.label}
          label={it.label}
          pos={{ x: it.x, y: it.y }}
          slug={it.slug}
        />
      ))}

      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-10 sm:py-5">
        <span className="text-muted text-[10px] uppercase tracking-[0.18em] sm:text-xs">
          Scroll to open
        </span>
        <nav className="flex flex-wrap gap-3 text-xs sm:gap-6 sm:text-sm">
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
