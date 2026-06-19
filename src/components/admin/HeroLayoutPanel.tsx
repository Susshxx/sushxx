"use client";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { setHeroPosition } from "@/lib/projects.functions";
import { getSiteSettings, updateHeroSettings } from "@/lib/settings.functions";

const DEFAULT_DESKTOP: { x: number; y: number }[] = [
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
const DEFAULT_MOBILE: { x: number; y: number }[] = [
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

type Project = Tables<"projects">;
type Pos = { x: number; y: number };
type Device = "desktop" | "mobile";

export function HeroLayoutPanel({
  projects,
  onChanged,
}: {
  projects: Project[];
  onChanged: () => void;
}) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const save = useServerFn(setHeroPosition);
  const getSettings = useServerFn(getSiteSettings);
  const saveHero = useServerFn(updateHeroSettings);
  const settingsQ = useQuery({ queryKey: ["siteSettings"], queryFn: () => getSettings() });

  const [device, setDevice] = useState<Device>("desktop");
  const [positions, setPositions] = useState<Record<string, Pos>>({});
  const [dragging, setDragging] = useState<string | null>(null);

  const [wordmark, setWordmark] = useState("Sush");
  const [sizeD, setSizeD] = useState(18);
  const [sizeM, setSizeM] = useState(28);

  useEffect(() => {
    const h = settingsQ.data?.settings.hero;
    if (h) {
      setWordmark(h.wordmark);
      setSizeD(h.size_desktop);
      setSizeM(h.size_mobile);
    }
  }, [settingsQ.data]);

  useEffect(() => {
    const next: Record<string, Pos> = {};
    const defaults = device === "mobile" ? DEFAULT_MOBILE : DEFAULT_DESKTOP;
    projects.forEach((p, i) => {
      const fb = defaults[i % defaults.length];
      if (device === "mobile") {
        next[p.id] = {
          x: p.hero_mobile_x != null ? Number(p.hero_mobile_x) : fb.x,
          y: p.hero_mobile_y != null ? Number(p.hero_mobile_y) : fb.y,
        };
      } else {
        next[p.id] = {
          x: p.hero_x != null ? Number(p.hero_x) : fb.x,
          y: p.hero_y != null ? Number(p.hero_y) : fb.y,
        };
      }
    });
    setPositions(next);
  }, [projects, device]);

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
          device,
          x: Math.round(pos.x * 100) / 100,
          y: Math.round(pos.y * 100) / 100,
        },
      });
      toast.success("Position saved");
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const resetAll = async () => {
    if (!confirm(`Reset ${device} hero positions to defaults?`)) return;
    try {
      await Promise.all(
        projects.map((p) =>
          save({ data: { id: p.id, device, x: null, y: null } }),
        ),
      );
      toast.success("Reset to defaults");
      onChanged();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const saveWordmark = async () => {
    try {
      await saveHero({
        data: { wordmark, size_desktop: sizeD, size_mobile: sizeM },
      });
      toast.success("Hero saved");
      settingsQ.refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const aspect = device === "mobile" ? "9 / 16" : "16 / 9";
  const maxW = device === "mobile" ? "320px" : "100%";
  const wmSize = device === "mobile" ? sizeM : sizeD;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl italic">Hero layout</h2>
        <div className="flex items-center gap-2">
          <div className="border-line flex overflow-hidden rounded border text-xs">
            {(["desktop", "mobile"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`px-3 py-1.5 uppercase tracking-wider ${
                  device === d ? "bg-fg text-bg" : "text-muted"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <button
            onClick={resetAll}
            className="border-line rounded border px-3 py-1.5 text-xs uppercase tracking-wider"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="border-line mb-6 grid gap-3 rounded border p-4 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="text-xs">
          <span className="text-muted mb-1 block uppercase tracking-wider">
            Hero wordmark
          </span>
          <input
            value={wordmark}
            onChange={(e) => setWordmark(e.target.value)}
            className="bg-bg border-line w-full rounded border px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-muted mb-1 block uppercase tracking-wider">
            Desktop size (vw)
          </span>
          <input
            type="number"
            min={4}
            max={40}
            value={sizeD}
            onChange={(e) => setSizeD(Number(e.target.value) || 0)}
            className="bg-bg border-line w-24 rounded border px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          <span className="text-muted mb-1 block uppercase tracking-wider">
            Mobile size (vw)
          </span>
          <input
            type="number"
            min={4}
            max={60}
            value={sizeM}
            onChange={(e) => setSizeM(Number(e.target.value) || 0)}
            className="bg-bg border-line w-24 rounded border px-2 py-1.5 text-sm"
          />
        </label>
        <div className="flex items-end">
          <button
            onClick={saveWordmark}
            className="bg-fg text-bg rounded px-3 py-1.5 text-xs uppercase tracking-wider"
          >
            Save
          </button>
        </div>
      </div>

      <p className="text-muted mb-3 text-xs">
        Drag each project label on the {device} canvas. Positions save automatically when you release.
      </p>
      <div className="mx-auto" style={{ maxWidth: maxW }}>
        <div
          ref={canvasRef}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="border-line bg-bg relative w-full overflow-hidden rounded border"
          style={{ aspectRatio: aspect }}
        >
          <div
            className="font-display absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-light italic leading-none text-fg/30 select-none pointer-events-none"
            style={{ fontSize: `clamp(2rem, ${wmSize * 0.6}%, 8rem)` }}
          >
            {wordmark}
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
                className={`font-display absolute select-none italic ${
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
                  fontSize: "clamp(0.75rem, 1vw, 1rem)",
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
    </div>
  );
}
