import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ContactInput = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(4000),
  // honeypot — bots typically fill all fields
  website: z.string().max(0).optional().default(""),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) => ContactInput.parse(input))
  .handler(async ({ data }) => {
    if (data.website) {
      // honeypot tripped — pretend it worked
      return { ok: true as const };
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listContactMessages = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdminSession } = await import("@/lib/admin-session.server");
  requireAdminSession();
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return { messages: data ?? [] };
});
