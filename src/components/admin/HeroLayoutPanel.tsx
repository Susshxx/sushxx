"use client";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { setHeroPosition } from "@/lib/projects.functions";

const DEFAULT_SCATTER: { x: number; y: number }[] = [
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

type Project = Tables<"projects">;
type Pos = { x: number; y: number };

export function HeroLayoutPanel({
  projects,
  onChanged,
}: {
  projects: Project[];
  onChanged: () => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const save = useServerFn(setHeroPosition);
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, Pos> = {};
    projects.forEach((p, i) => {
      const fb = DEFAULT_SCATTER[i % DEFAULT_SCATTER.length];
      next[p.id] = {
        x: p.hero_x != null ? Number(p.hero_x) : fb.x,
        y: p.hero_y != null ? Number(p.hero_y) : fb.y,
      };
    });
    setPositions(next);
  }, [projects]);

  const onPointerDown = (id: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setPositions((prev) => ({ ...prev, [dragging]: { x, y } }));
  };

  const onPointerUp = async (e: React.PointerEvent) => {
    if (!dragging) return;
    const id = dragging;
    setDragging(null);
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
    const pos = positions[id];
    if (!pos) return;
    try {
      await save({
        data: {
          id,
          hero_x: Math.round(pos.x * 100) / 100,
          hero_y: Math.round(pos.y * 100) / 100,
        },
      });
      toast.success("Position saved");
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const resetAll = async () => {
    if (!confirm("Reset all hero label positions to defaults?")) return;
    try {
      await Promise.all(
        projects.map((p) =>
          save({ data: { id: p.id, hero_x: null, hero_y: null, hero_rotate: null } }),
        ),
      );
      toast.success("Reset to defaults");
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl italic">Hero layout</h2>
        <button
          onClick={resetAll}
          className="border-line rounded border px-3 py-1.5 text-xs uppercase tracking-wider"
        >
          Reset defaults
        </button>
      </div>
      <p className="text-muted mb-3 text-xs">
        Drag each project label to place it on the hero canvas. Positions save automatically when you release.
      </p>
      <div
        ref={canvasRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="border-line bg-bg relative w-full overflow-hidden rounded border"
        style={{ aspectRatio: "16 / 9" }}
      >
        {/* Center wordmark reference */}
        <div className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(3rem,12vw,8rem)] font-light italic leading-none text-fg/30 select-none pointer-events-none">
          Sush
        </div>

        {projects.length === 0 ? (
          <div className="text-muted absolute inset-0 grid place-items-center text-sm">
            Add projects first.
          </div>
        ) : null}

        {projects.map((p) => {
          const pos = positions[p.id] ?? { x: 50, y: 50 };
          const active = dragging === p.id;
          return (
            <div
              key={p.id}
              onPointerDown={onPointerDown(p.id)}
              className={`font-display absolute select-none italic transition-shadow ${
                active ? "z-20" : "z-10"
              }`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
                cursor: active ? "grabbing" : "grab",
                touchAction: "none",
                padding: "4px 10px",
                borderRadius: 6,
                background: active ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                border: active ? "1px solid rgba(239,68,68,0.6)" : "1px solid var(--line)",
                color: "var(--fg)",
                fontSize: "clamp(0.85rem, 1.1vw, 1rem)",
                whiteSpace: "nowrap",
              }}
              title={`${p.title} — ${pos.x.toFixed(0)}%, ${pos.y.toFixed(0)}%`}
            >
              {p.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
