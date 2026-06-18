"use client";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const rowRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => {
        setHovered(true);
        videoRef.current?.play().catch(() => {});
      }}
      onMouseLeave={() => {
        setHovered(false);
        videoRef.current?.pause();
      }}
      onMouseMove={onMove}
      className="border-line group relative border-b"
    >
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="grid grid-cols-[80px_1fr_auto] items-start gap-6 px-2 py-10 md:grid-cols-[160px_1fr_auto] md:gap-10 md:py-14"
      >
        <span className="text-muted text-xs uppercase tracking-[0.2em] md:pt-2">
          {String(index + 1).padStart(2, "0")}
          {project.tech.length > 0 ? (
            <span className="text-muted/70 mt-1 hidden md:block">
              {project.tech.slice(0, 2).join(" · ")}
            </span>
          ) : null}
        </span>

        <div className="min-w-0">
          <h3 className="font-display text-3xl italic transition-opacity md:text-5xl">
            {project.title}
          </h3>
          {project.description ? (
            <p className="text-muted mt-3 max-w-xl text-sm leading-relaxed md:text-base">
              {project.description}
            </p>
          ) : null}
        </div>

        <span className="text-muted hidden self-center text-xs uppercase tracking-[0.18em] transition-transform group-hover:translate-x-1 md:block">
          View →
        </span>
      </Link>

      {/* Floating hover preview */}
      <AnimatePresence>
        {hovered && (project.video_url || project.cover_url) ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              left: mouse.x,
              top: mouse.y,
              transform: "translate(-50%, -50%)",
            }}
            className="pointer-events-none absolute z-10 hidden h-56 w-80 overflow-hidden rounded-md shadow-2xl md:block"
          >
            {project.video_url ? (
              <video
                ref={videoRef}
                src={project.video_url}
                muted
                loop
                playsInline
                preload="metadata"
                poster={project.cover_url ?? undefined}
                className="h-full w-full object-cover"
              />
            ) : project.cover_url ? (
              <img
                src={project.cover_url}
                alt={project.title}
                className="h-full w-full object-cover"
              />
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
