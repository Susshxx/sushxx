"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type ProgressListener = (p: number) => void;

type Ctx = {
  progressRef: { current: number };
  subscribe: (cb: ProgressListener) => () => void;
  publish: (p: number) => void;
};

const ScrollProgressContext = createContext<Ctx | null>(null);

export function ScrollProgressProvider({ children }: { children: ReactNode }) {
  const progressRef = useRef(0);
  const listeners = useRef(new Set<ProgressListener>());

  const subscribe = useCallback((cb: ProgressListener) => {
    listeners.current.add(cb);
    cb(progressRef.current);
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  const publish = useCallback((p: number) => {
    const clamped = Math.max(0, Math.min(1, p));
    if (clamped === progressRef.current) return;
    progressRef.current = clamped;
    listeners.current.forEach((cb) => cb(clamped));
  }, []);

  const value = useMemo(() => ({ progressRef, subscribe, publish }), [subscribe, publish]);

  return (
    <ScrollProgressContext.Provider value={value}>{children}</ScrollProgressContext.Provider>
  );
}

export function useScrollProgress() {
  const ctx = useContext(ScrollProgressContext);
  if (!ctx) throw new Error("useScrollProgress must be inside ScrollProgressProvider");
  return ctx;
}

/** Imperative subscriber — never re-renders the caller. */
export function useProgressEffect(cb: ProgressListener) {
  const ctx = useScrollProgress();
  const cbRef = useRef(cb);
  cbRef.current = cb;
  useEffect(() => ctx.subscribe((p) => cbRef.current(p)), [ctx]);
}
