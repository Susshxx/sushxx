"use client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContactMessages } from "@/lib/contact.functions";

export function MessagesTable() {
  const list = useServerFn(listContactMessages);
  const q = useQuery({ queryKey: ["messages"], queryFn: () => list() });

  if (q.isLoading) return <p className="text-muted text-sm">Loading…</p>;
  if (q.error) return <p className="text-sm text-red-400">{(q.error as Error).message}</p>;

  const rows = q.data?.messages ?? [];
  return (
    <div>
      <h2 className="font-display mb-4 text-2xl italic">Messages</h2>
      <div className="border-line divide-line divide-y rounded border">
        {rows.map((m) => (
          <div key={m.id} className="grid gap-1 px-4 py-3 text-sm">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">{m.name}</span>
              <span className="text-muted text-xs">
                {new Date(m.created_at).toLocaleString()}
              </span>
            </div>
            <a className="text-muted text-xs hover:underline" href={`mailto:${m.email}`}>
              {m.email}
            </a>
            <p className="text-fg/85 mt-2 whitespace-pre-line text-sm">{m.message}</p>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="text-muted p-4 text-sm">No messages yet.</div>
        ) : null}
      </div>
    </div>
  );
}
