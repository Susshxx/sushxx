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
