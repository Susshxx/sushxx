import { ProjectCard } from "./ProjectCard";
import type { Tables } from "@/integrations/supabase/types";

export function ProjectGrid({ projects }: { projects: Tables<"projects">[] }) {
  if (projects.length === 0) {
    return (
      <p className="text-muted text-sm italic">No projects yet.</p>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-x-10 md:gap-y-16">
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
    </div>
  );
}
