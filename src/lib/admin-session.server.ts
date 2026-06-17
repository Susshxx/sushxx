import { createHmac, timingSafeEqual } from "crypto";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const COOKIE_NAME = "sush_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.ADMIN_CODE;
  if (!s) throw new Error("ADMIN_CODE is not configured");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Verifies a submitted code. Constant-time compare. */
export function verifyCode(code: string): boolean {
  const a = Buffer.from(code, "utf8");
  const b = Buffer.from(secret(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Sets the signed admin cookie. */
export function grantAdminCookie() {
  const issued = Date.now().toString();
  const sig = sign(issued);
  setCookie(COOKIE_NAME, `${issued}.${sig}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAdminCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export function hasAdminSession(): boolean {
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return false;
  const [issued, sig] = raw.split(".");
  if (!issued || !sig) return false;
  const ageMs = Date.now() - Number(issued);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > MAX_AGE * 1000) return false;
  const expected = sign(issued);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function requireAdminSession() {
  if (!hasAdminSession()) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
