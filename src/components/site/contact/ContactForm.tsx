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
    <form onSubmit={onSubmit} className="mx-auto grid w-full max-w-2xl gap-10">
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
      <FloatField label="Your name" value={name} onChange={setName} required />
      <FloatField label="Email" type="email" value={email} onChange={setEmail} required />
      <FloatField
        label="Tell me about your project"
        value={message}
        onChange={setMessage}
        as="textarea"
        required
      />
      <div>
        <button
          disabled={busy}
          type="submit"
          className="border-fg text-fg hover:bg-fg hover:text-bg border px-8 py-4 text-xs uppercase tracking-[0.28em] transition-colors disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

function FloatField({
  label,
  value,
  onChange,
  type = "text",
  required,
  as,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  as?: "textarea";
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const common = {
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    required,
    className:
      "text-fg w-full resize-none border-0 border-b border-line/60 bg-transparent pt-7 pb-2 text-base outline-none focus:border-fg transition-colors",
  };
  return (
    <label className="relative block">
      <span
        className={`text-muted pointer-events-none absolute left-0 transition-all ${
          active
            ? "top-0 text-[10px] uppercase tracking-[0.22em]"
            : "top-7 text-base"
        }`}
      >
        {label}
      </span>
      {as === "textarea" ? (
        <textarea rows={4} {...(common as React.TextareaHTMLAttributes<HTMLTextAreaElement>)} />
      ) : (
        <input type={type} {...(common as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </label>
  );
}
