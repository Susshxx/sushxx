"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollProgressProvider, useScrollProgress } from "./scroll-progress";
import { HeroFrameCanvas } from "./HeroFrameCanvas";
import { HeroOverlayContent } from "./HeroOverlayContent";
import type { Tables } from "@/integrations/supabase/types";

/** Detects coarse-pointer/small-viewport/reduced-motion to disable scrub. */
function useShouldScrub() {
  const [enabled, setEnabled] = useState<boolean>(false);
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!isMobile && !reduce);
  }, []);
  return enabled;
}

function PinnedScrub() {
  const { publish } = useScrollProgress();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<unknown>(null);

  // Lenis smooth scroll.
  useEffect(() => {
    let mounted = true;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    (async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      if (!mounted) return;
      lenis = new Lenis({
        duration: 1.0,
        smoothWheel: true,
        wheelMultiplier: 1.0,
      }) as unknown as { raf: (t: number) => void; destroy: () => void };
      lenisRef.current = lenis;
      let rafId = 0;
      const tick = (t: number) => {
        lenis!.raf(t);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
      (lenis as unknown as { _cleanup: () => void })._cleanup = () =>
        cancelAnimationFrame(rafId);
    })();
    return () => {
      mounted = false;
      const l = lenisRef.current as { destroy: () => void; _cleanup?: () => void } | null;
      l?._cleanup?.();
      l?.destroy?.();
    };
  }, []);

  // Compute progress from scroll position within the wrapper.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const p = total > 0 ? scrolled / total : 0;
      publish(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [publish]);

  return (
    <section
      ref={wrapperRef}
      // 350vh of scroll distance for the pinned hero.
      style={{ height: "350vh" }}
      className="relative bg-bg text-fg"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <HeroFrameCanvas />
        <HeroOverlayContent />
      </div>
    </section>
  );
}

function StaticHero() {
  // Mobile / reduced-motion fallback: show last frame + overlay (no scrub).
  return (
    <section className="relative min-h-screen w-full bg-bg text-fg">
      <div className="relative h-screen w-full overflow-hidden">
        <ScrollProgressProvider>
          <StaticOnce />
          <HeroFrameCanvas />
          <HeroOverlayContent />
        </ScrollProgressProvider>
      </div>
    </section>
  );
}

function StaticOnce() {
  const { publish } = useScrollProgress();
  useEffect(() => {
    publish(0);
  }, [publish]);
  return null;
}

export function HeroStage() {
  const scrub = useShouldScrub();
  if (!scrub) return <StaticHero />;
  return (
    <ScrollProgressProvider>
      <PinnedScrub />
    </ScrollProgressProvider>
  );
}
