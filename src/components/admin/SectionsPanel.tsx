"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getSectionsVisibility,
  updateSectionsVisibility,
  type SectionsVisibility,
} from "@/lib/settings.functions";
import { useQuery } from "@tanstack/react-query";

export function SectionsPanel() {
  const get = useServerFn(getSectionsVisibility);
  const set = useServerFn(updateSectionsVisibility);
  const q = useQuery({ queryKey: ["sections"], queryFn: () => get() });
  const [busy, setBusy] = useState(false);

  const v = q.data?.visibility;

  const toggle = async (key: keyof SectionsVisibility) => {
    if (!v) return;
    setBusy(true);
    const next = { ...v, [key]: !v[key] };
    try {
      await set({ data: next });
      toast.success("Updated");
      q.refetch();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!v) return <p className="text-muted text-sm">Loading…</p>;

  return (
    <div>
      <h2 className="font-display mb-4 text-2xl italic">Sections</h2>
      <p className="text-muted mb-4 text-sm">
        Toggle which sections appear on the homepage.
      </p>
      <div className="border-line divide-line divide-y rounded border">
        {(["projects", "experience", "contact"] as const).map((k) => (
          <label
            key={k}
            className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm"
          >
            <span className="capitalize">{k}</span>
            <input
              type="checkbox"
              disabled={busy}
              checked={v[k]}
              onChange={() => toggle(k)}
              className="h-4 w-4"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
