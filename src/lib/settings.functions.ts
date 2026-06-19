import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type SectionsVisibility = {
  projects: boolean;
  experience: boolean;
  contact: boolean;
};

const DEFAULT_VISIBILITY: SectionsVisibility = {
  projects: true,
  experience: true,
  contact: true,
};

export type HeroSettings = {
  wordmark: string;
  size_desktop: number; // in vw
  size_mobile: number; // in vw
};

const DEFAULT_HERO: HeroSettings = {
  wordmark: "Sush",
  size_desktop: 18,
  size_mobile: 28,
};

export type SiteSettings = {
  hero: HeroSettings;
  resume_url: string | null;
};

export const getSectionsVisibility = createServerFn({ method: "GET" }).handler(async () => {
  const { getSupabasePublic } = await import("./supabase-public.server");
  const sb = getSupabasePublic();
  const { data } = await sb
    .from("site_settings")
    .select("value")
    .eq("key", "sections_visibility")
    .maybeSingle();
  const value = (data?.value ?? DEFAULT_VISIBILITY) as SectionsVisibility;
  return { visibility: { ...DEFAULT_VISIBILITY, ...value } };
});

export const updateSectionsVisibility = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        projects: z.boolean(),
        experience: z.boolean(),
        contact: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_settings").upsert(
      { key: "sections_visibility", value: data },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const getSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { getSupabasePublic } = await import("./supabase-public.server");
  const sb = getSupabasePublic();
  const { data } = await sb
    .from("site_settings")
    .select("key,value")
    .in("key", ["hero", "resume_url"]);
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  const hero = { ...DEFAULT_HERO, ...((map.get("hero") as Partial<HeroSettings>) ?? {}) };
  const resume_url = (map.get("resume_url") as string | null) ?? null;
  return { settings: { hero, resume_url } as SiteSettings };
});

export const updateHeroSettings = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        wordmark: z.string().min(1).max(40),
        size_desktop: z.number().min(4).max(40),
        size_mobile: z.number().min(4).max(60),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "hero", value: data }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const setResumeUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ url: z.string().url().nullable() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "resume_url", value: data.url }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
