"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { upsertProject, deleteProject } from "@/lib/projects.functions";

type Project = Tables<"projects">;

export function ProjectEditorDialog({
  project,
  onClose,
  onSaved,
}: {
  project: Partial<Project>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<Partial<Project>>({
    slug: "",
    title: "",
    description: "",
    tech: [],
    cover_url: "",
    video_url: "",
    link_url: "",
    featured: true,
    sort_order: 0,
    ...project,
  });
  const [busy, setBusy] = useState(false);
  const upsert = useServerFn(upsertProject);

  const onSave = async () => {
    setBusy(true);
    try {
      await upsert({
        data: {
          id: draft.id,
          slug: (draft.slug || "").trim(),
          title: (draft.title || "").trim(),
          description: draft.description || "",
          tech: draft.tech || [],
          cover_url: draft.cover_url || null,
          video_url: draft.video_url || null,
          link_url: draft.link_url || null,
          featured: draft.featured ?? true,
          sort_order: draft.sort_order ?? 0,
        },
      });
      toast.success("Saved");
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6">
        <h3 className="font-display mb-4 text-2xl italic">
          {draft.id ? "Edit project" : "New project"}
        </h3>
        <div className="grid gap-3">
          <Field label="Slug">
            <input
              className="input"
              value={draft.slug ?? ""}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              placeholder="my-project"
            />
          </Field>
          <Field label="Title">
            <input
              className="input"
              value={draft.title ?? ""}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="input"
              rows={4}
              value={draft.description ?? ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </Field>
          <Field label="Tech (comma-separated)">
            <input
              className="input"
              value={(draft.tech ?? []).join(", ")}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tech: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Cover URL">
            <input
              className="input"
              value={draft.cover_url ?? ""}
              onChange={(e) => setDraft({ ...draft, cover_url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Video URL">
            <input
              className="input"
              value={draft.video_url ?? ""}
              onChange={(e) => setDraft({ ...draft, video_url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="External link">
            <input
              className="input"
              value={draft.link_url ?? ""}
              onChange={(e) => setDraft({ ...draft, link_url: e.target.value })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Sort order">
            <input
              className="input"
              type="number"
              value={draft.sort_order ?? 0}
              onChange={(e) =>
                setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
              }
            />
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="border-line rounded border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            disabled={busy}
            onClick={onSave}
            className="bg-fg text-bg rounded px-4 py-2 text-sm uppercase tracking-wider"
          >
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
      <style>{`.input{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px 10px;width:100%;color:var(--fg);font-size:14px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-muted text-xs uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

export function ProjectsTable({
  projects,
  onChanged,
}: {
  projects: Project[];
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const del = useServerFn(deleteProject);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl italic">Projects</h2>
        <button
          onClick={() => setEditing({})}
          className="bg-fg text-bg rounded px-3 py-2 text-xs uppercase tracking-wider"
        >
          + New project
        </button>
      </div>
      <div className="border-line divide-line divide-y rounded border">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium">{p.title}</div>
              <div className="text-muted truncate text-xs">/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(p)}
                className="border-line rounded border px-3 py-1 text-xs"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm(`Delete "${p.title}"?`)) return;
                  try {
                    await del({ data: { id: p.id } });
                    toast.success("Deleted");
                    onChanged();
                  } catch (e) {
                    toast.error((e as Error).message);
                  }
                }}
                className="border-line text-muted rounded border px-3 py-1 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 ? (
          <div className="text-muted p-4 text-sm">No projects yet.</div>
        ) : null}
      </div>
      {editing ? (
        <ProjectEditorDialog
          project={editing}
          onClose={() => setEditing(null)}
          onSaved={onChanged}
        />
      ) : null}
    </div>
  );
}
