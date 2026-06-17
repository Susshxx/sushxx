"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { verifyAdminCode } from "@/lib/admin.functions";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const verify = useServerFn(verifyAdminCode);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const r = await verify({ data: { code } });
          if (r.ok) {
            toast.success("Welcome back.");
            onSuccess();
          } else {
            toast.error("Wrong code.");
          }
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
      className="bg-card mx-auto mt-32 w-full max-w-sm rounded-lg p-8"
    >
      <h1 className="font-display mb-2 text-3xl italic">Admin</h1>
      <p className="text-muted mb-6 text-sm">Enter the access code.</p>
      <input
        type="password"
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="border-line bg-bg text-fg mb-4 w-full rounded border px-3 py-2"
        placeholder="••••••••"
      />
      <button
        type="submit"
        disabled={busy || !code}
        className="bg-fg text-bg w-full rounded px-4 py-2 text-sm uppercase tracking-wider disabled:opacity-50"
      >
        {busy ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
