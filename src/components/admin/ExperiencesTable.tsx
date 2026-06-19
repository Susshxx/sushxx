"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";
import { upsertExperience, deleteExperience } from "@/lib/experiences.functions";
import { getSiteSettings, setResumeUrl } from "@/lib/settings.functions";
import { uploadProjectMedia } from "@/lib/uploads.functions";

type Exp = Tables<"experiences">;
const EMPTY: Partial<Exp> = { role: "", company: "", period: "", summary: "", sort_order: 0 };

export function ExperiencesTable({
  experiences,
  onChanged,
}: {
  experiences: Exp[];
  onChanged: () => void;
}) {
  const [draft, setDraft] = useState<Partial<Exp> | null>(null);
  const [uploading, setUploading] = useState(false);
  const upsert = useServerFn(upsertExperience);
  const del = useServerFn(deleteExperience);
  const getSettings = useServerFn(getSiteSettings);
  const saveResume = useServerFn(setResumeUrl);
  const upload = useServerFn(uploadProjectMedia);
  const settingsQ = useQuery({ queryKey: ["siteSettings"], queryFn: () => getSettings() });
  const resumeUrl = settingsQ.data?.settings.resume_url ?? null;

  const onResumeFile = async (file: File) => {
    setUploading(true);
    try {
      const buf = await file.arrayBuffer();
      const b64 = btoa(
        new Uint8Array(buf).reduce((s, b) => s + String.fromCharCode(b), ""),
      );
      const { url } = await upload({
        data: { filename: file.name, contentType: file.type || "application/pdf", base64: b64 },
      });
      await saveResume({ data: { url } });
      toast.success("Resume uploaded");
      settingsQ.refetch();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const removeResume = async () => {
    if (!confirm("Remove resume?")) return;
    try {
      await saveResume({ data: { url: null } });
      toast.success("Removed");
      settingsQ.refetch();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const save = async () => {
    if (!draft) return;
    try {
      await upsert({
        data: {
          id: draft.id,
          role: draft.role || "",
          company: draft.company || "",
          period: draft.period || "",
          summary: draft.summary || "",
          sort_order: draft.sort_order ?? 0,
        },
      });
      toast.success("Saved");
      setDraft(null);
      onChanged();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl italic">Experience</h2>
        <button
          onClick={() => setDraft({ ...EMPTY })}
          className="bg-fg text-bg rounded px-3 py-2 text-xs uppercase tracking-wider"
        >
          + New experience
        </button>
      </div>

      <div className="border-line mb-6 flex flex-wrap items-center justify-between gap-3 rounded border p-4">
        <div className="text-sm">
          <div className="text-muted text-xs uppercase tracking-wider">Résumé</div>
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 hover:underline"
            >
              View current resume ↗
            </a>
          ) : (
            <span className="text-muted">No resume uploaded.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="border-line cursor-pointer rounded border px-3 py-1.5 text-xs uppercase tracking-wider">
            {uploading ? "Uploading…" : resumeUrl ? "Replace" : "Upload"}
            <input
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onResumeFile(f);
                e.target.value = "";
              }}
            />
          </label>
          {resumeUrl ? (
            <button
              onClick={removeResume}
              className="border-line text-muted rounded border px-3 py-1.5 text-xs uppercase tracking-wider"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>
      <div className="border-line divide-line divide-y rounded border">
        {experiences.map((e) => (
          <div key={e.id} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_auto]">
            <div>
              <div className="font-medium">
                {e.role} · {e.company}
              </div>
              <div className="text-muted text-xs">{e.period}</div>
              {e.summary ? <div className="text-fg/80 mt-1 text-xs">{e.summary}</div> : null}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDraft(e)}
                className="border-line rounded border px-3 py-1 text-xs"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (!confirm("Delete?")) return;
                  try {
                    await del({ data: { id: e.id } });
                    toast.success("Deleted");
                    onChanged();
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                }}
                className="border-line text-muted rounded border px-3 py-1 text-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {experiences.length === 0 ? (
          <div className="text-muted p-4 text-sm">No experiences yet.</div>
        ) : null}
      </div>

      {draft ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-card w-full max-w-xl rounded-lg p-6">
            <h3 className="font-display mb-4 text-xl italic">
              {draft.id ? "Edit" : "New"} experience
            </h3>
            <div className="grid gap-3">
              <input
                className="input"
                value={draft.role ?? ""}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                placeholder="Role"
              />
              <input
                className="input"
                value={draft.company ?? ""}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
                placeholder="Company"
              />
              <input
                className="input"
                value={draft.period ?? ""}
                onChange={(e) => setDraft({ ...draft, period: e.target.value })}
                placeholder="Period"
              />
              <textarea
                className="input"
                rows={4}
                value={draft.summary ?? ""}
                onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                placeholder="Summary"
              />
              <input
                className="input"
                type="number"
                value={draft.sort_order ?? 0}
                onChange={(e) =>
                  setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                }
                placeholder="Sort order"
              />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDraft(null)}
                className="border-line rounded border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={save}
                className="bg-fg text-bg rounded px-4 py-2 text-sm uppercase tracking-wider"
              >
                Save
              </button>
            </div>
          </div>
          <style>{`.input{background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:8px 10px;width:100%;color:var(--fg);font-size:14px}`}</style>
        </div>
      ) : null}
    </div>
  );
}
