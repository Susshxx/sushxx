"use client";
import { useEffect, useRef } from "react";

/** Preloads a sliding window of frames around currentIndex. */
export function useFramePreloader(urls: string[], currentIndexRef: { current: number }) {
  const cache = useRef<Map<number, HTMLImageElement>>(new Map());
  const lastWindow = useRef<{ lo: number; hi: number }>({ lo: -1, hi: -1 });

  useEffect(() => {
    const WINDOW = 12;
    let raf = 0;
    const tick = () => {
      const idx = currentIndexRef.current;
      const lo = Math.max(0, idx - WINDOW);
      const hi = Math.min(urls.length - 1, idx + WINDOW);
      if (lo !== lastWindow.current.lo || hi !== lastWindow.current.hi) {
        lastWindow.current = { lo, hi };
        for (let i = lo; i <= hi; i++) {
          if (!cache.current.has(i)) {
            const img = new Image();
            img.decoding = "async";
            img.src = urls[i];
            cache.current.set(i, img);
          }
        }
        // evict far frames
        for (const k of Array.from(cache.current.keys())) {
          if (k < lo - WINDOW || k > hi + WINDOW) cache.current.delete(k);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [urls, currentIndexRef]);

  return cache;
}
