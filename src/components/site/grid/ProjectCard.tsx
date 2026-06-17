"use client";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { Tables } from "@/integrations/supabase/types";

type Project = Tables<"projects">;

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.7, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="group block"
      >
        <div className="bg-card relative aspect-[4/3] w-full overflow-hidden rounded-md">
          {project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-fg/30 text-6xl italic">
                {project.title.slice(0, 1)}
              </span>
            </div>
          )}
          {project.video_url ? (
            <video
              src={project.video_url}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              onMouseEnter={(e) => {
                const v = e.currentTarget;
                v.play().catch(() => {});
              }}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          ) : null}
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="font-display text-2xl italic">{project.title}</h3>
          <span className="text-muted text-xs uppercase tracking-[0.18em]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        {project.tech.length > 0 ? (
          <p className="text-muted mt-1 text-sm">{project.tech.slice(0, 4).join(" · ")}</p>
        ) : null}
      </Link>
    </motion.div>
  );
}
