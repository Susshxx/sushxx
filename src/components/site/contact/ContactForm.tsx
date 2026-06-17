"use client";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/contact.functions";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);

  const submit = useServerFn(submitContactMessage);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: { name, email, message, website } });
      toast.success("Message sent. I'll be in touch.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error((err as Error).message || "Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-line text-fg placeholder:text-muted border-b bg-transparent py-3 outline-none focus:border-fg"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-line text-fg placeholder:text-muted border-b bg-transparent py-3 outline-none focus:border-fg"
        />
      </div>
      <textarea
        required
        placeholder="What are you working on?"
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="border-line text-fg placeholder:text-muted border-b bg-transparent py-3 outline-none focus:border-fg"
      />
      <div>
        <button
          disabled={busy}
          type="submit"
          className="bg-fg text-bg inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
