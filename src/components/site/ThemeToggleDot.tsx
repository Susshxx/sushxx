"use client";
import { useEffect, useState } from "react";

const KEY = "sush-theme";

export function ThemeToggleDot() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as "light" | "dark" | null) ?? "dark";
    setTheme(stored);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(next);
    root.style.colorScheme = next;
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="fixed bottom-5 right-5 z-50 h-3 w-3 rounded-full border border-fg/30 bg-fg transition-transform hover:scale-125"
    />
  );
}
