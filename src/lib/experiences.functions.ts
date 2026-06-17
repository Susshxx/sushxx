import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ExperienceInput = z.object({
  id: z.string().uuid().optional(),
  role: z.string().min(1),
  company: z.string().min(1),
  period: z.string().default(""),
  summary: z.string().default(""),
  sort_order: z.number().int().default(0),
});

export const listExperiences = createServerFn({ method: "GET" }).handler(async () => {
  const { getSupabasePublic } = await import("./supabase-public.server");
  const sb = getSupabasePublic();
  const { data, error } = await sb
    .from("experiences")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { experiences: data ?? [] };
});

export const upsertExperience = createServerFn({ method: "POST" })
  .inputValidator((input) => ExperienceInput.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("experiences")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { experience: row };
  });

export const deleteExperience = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("experiences").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
