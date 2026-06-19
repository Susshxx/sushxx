"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollProgressProvider, useScrollProgress } from "./scroll-progress";
import { HeroFrameCanvas } from "./HeroFrameCanvas";
import { HeroOverlayContent } from "./HeroOverlayContent";
import type { Tables } from "@/integrations/supabase/types";
import type { HeroSettings } from "@/lib/settings.functions";

/** Only disable scrub for reduced-motion users; mobile gets scrub too. */
function useShouldScrub() {
  const [enabled, setEnabled] = useState<boolean>(true);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(!reduce);
  }, []);
  return enabled;
}

type Props = {
  projects?: Tables<"projects">[];
  hero?: HeroSettings;
};

function PinnedScrub({
  projects,
  hero,
}: {
  projects: Tables<"projects">[];
  hero?: HeroSettings;
}) {
  const { publish } = useScrollProgress();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const lenisRef = useRef<unknown>(null);

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
        syncTouch: true,
      } as unknown as ConstructorParameters<typeof Lenis>[0]) as unknown as {
        raf: (t: number) => void;
        destroy: () => void;
      };
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
      style={{ height: "350vh" }}
      className="relative bg-bg text-fg"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <HeroFrameCanvas />
        <HeroOverlayContent projects={projects} hero={hero} />
      </div>
    </section>
  );
}

function StaticHero({
  projects,
  hero,
}: {
  projects: Tables<"projects">[];
  hero?: HeroSettings;
}) {
  return (
    <section className="relative min-h-screen w-full bg-bg text-fg">
      <div className="relative h-screen w-full overflow-hidden">
        <ScrollProgressProvider>
          <StaticOnce />
          <HeroFrameCanvas />
          <HeroOverlayContent projects={projects} hero={hero} />
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

export function HeroStage({ projects = [], hero }: Props) {
  const scrub = useShouldScrub();
  if (!scrub) return <StaticHero projects={projects} hero={hero} />;
  return (
    <ScrollProgressProvider>
      <PinnedScrub projects={projects} hero={hero} />
    </ScrollProgressProvider>
  );
}
