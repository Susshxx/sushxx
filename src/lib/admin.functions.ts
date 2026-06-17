import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const verifyAdminCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ code: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { verifyCode, grantAdminCookie } = await import("./admin-session.server");
    if (!verifyCode(data.code)) {
      return { ok: false as const };
    }
    grantAdminCookie();
    return { ok: true as const };
  });

export const adminSignOut = createServerFn({ method: "POST" }).handler(async () => {
  const { clearAdminCookie } = await import("./admin-session.server");
  clearAdminCookie();
  return { ok: true as const };
});

export const isAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const { hasAdminSession } = await import("./admin-session.server");
  return { admin: hasAdminSession() };
});
