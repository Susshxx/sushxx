"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { upsertExperience, deleteExperience } from "@/lib/experiences.functions";

type Exp = Tables<"experiences">;

export function ExperienceRow({
  experience,
  isAdmin,
  onChanged,
}: {
  experience: Exp;
  isAdmin: boolean;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(experience);
  const [busy, setBusy] = useState(false);

  const upsert = useServerFn(upsertExperience);
  const del = useServerFn(deleteExperience);

  if (editing && isAdmin) {
    return (
      <div className="border-line grid gap-3 border-t py-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <div className="grid gap-2 md:grid-cols-2">
            <input
              className="bg-card border-line w-full rounded border px-3 py-2 text-sm"
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              placeholder="Role"
            />
            <input
              className="bg-card border-line w-full rounded border px-3 py-2 text-sm"
              value={draft.company}
              onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              placeholder="Company"
            />
          </div>
          <input
            className="bg-card border-line w-full rounded border px-3 py-2 text-sm"
            value={draft.period}
            onChange={(e) => setDraft({ ...draft, period: e.target.value })}
            placeholder="Period (e.g. 2023 — Present)"
          />
          <textarea
            className="bg-card border-line w-full rounded border px-3 py-2 text-sm"
            rows={3}
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            placeholder="Summary"
          />
        </div>
        <div className="flex flex-row gap-2 md:flex-col">
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await upsert({
                  data: {
                    id: draft.id,
                    role: draft.role,
                    company: draft.company,
                    period: draft.period,
                    summary: draft.summary,
                    sort_order: draft.sort_order,
                  },
                });
                toast.success("Saved");
                setEditing(false);
                onChanged();
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            className="bg-fg text-bg rounded px-3 py-2 text-xs uppercase tracking-wider"
          >
            Save
          </button>
          <button
            onClick={() => {
              setDraft(experience);
              setEditing(false);
            }}
            className="border-line text-fg rounded border px-3 py-2 text-xs uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              if (!confirm("Delete this experience?")) return;
              setBusy(true);
              try {
                await del({ data: { id: experience.id } });
                toast.success("Deleted");
                onChanged();
              } catch (e) {
                toast.error((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
            className="border-line text-muted rounded border px-3 py-2 text-xs uppercase tracking-wider"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-line group grid gap-2 border-t py-8 md:grid-cols-[160px_1fr]">
      <div className="text-muted text-xs uppercase tracking-[0.18em]">{experience.period}</div>
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl italic">
            {experience.role} · <span className="not-italic">{experience.company}</span>
          </h3>
          {isAdmin ? (
            <button
              onClick={() => setEditing(true)}
              className="text-muted hover:text-fg text-xs underline-offset-4 hover:underline"
            >
              Edit
            </button>
          ) : null}
        </div>
        {experience.summary ? (
          <p className="text-fg/80 mt-2 max-w-2xl text-sm leading-relaxed">
            {experience.summary}
          </p>
        ) : null}
      </div>
    </div>
  );
}
