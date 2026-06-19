import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ProjectInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().default(""),
  tech: z.array(z.string()).default([]),
  cover_url: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  link_url: z.string().nullable().optional(),
  featured: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  hero_x: z.number().nullable().optional(),
  hero_y: z.number().nullable().optional(),
  hero_rotate: z.number().nullable().optional(),
});

export const listProjects = createServerFn({ method: "GET" }).handler(async () => {
  const { getSupabasePublic } = await import("./supabase-public.server");
  const sb = getSupabasePublic();
  const { data, error } = await sb
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { projects: data ?? [] };
});

export const getProjectBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { getSupabasePublic } = await import("./supabase-public.server");
    const sb = getSupabasePublic();
    const { data: row, error } = await sb
      .from("projects")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { project: row };
  });

export const upsertProject = createServerFn({ method: "POST" })
  .inputValidator((input) => ProjectInput.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("projects")
      .upsert(data, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { project: row };
  });

export const setHeroPosition = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        device: z.enum(["desktop", "mobile"]).default("desktop"),
        x: z.number().nullable(),
        y: z.number().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch =
      data.device === "mobile"
        ? { hero_mobile_x: data.x, hero_mobile_y: data.y }
        : { hero_x: data.x, hero_y: data.y };
    const { error } = await supabaseAdmin
      .from("projects")
      .update(patch)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
