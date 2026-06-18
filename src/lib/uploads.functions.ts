import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const UploadInput = z.object({
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  // base64-encoded file bytes (no data: prefix)
  base64: z.string().min(1),
});

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export const uploadProjectMedia = createServerFn({ method: "POST" })
  .inputValidator((input) => UploadInput.parse(input))
  .handler(async ({ data }) => {
    const { requireAdminSession } = await import("./admin-session.server");
    requireAdminSession();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
    const bytes = Buffer.from(data.base64, "base64");

    const { error: upErr } = await supabaseAdmin.storage
      .from("project-media")
      .upload(path, bytes, {
        contentType: data.contentType,
        cacheControl: "31536000",
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("project-media")
      .createSignedUrl(path, TEN_YEARS);
    if (sErr || !signed?.signedUrl) throw new Error(sErr?.message ?? "sign failed");

    return { url: signed.signedUrl };
  });
