import { ProjectCard } from "./ProjectCard";
import type { Tables } from "@/integrations/supabase/types";

export function ProjectGrid({ projects }: { projects: Tables<"projects">[] }) {
  if (projects.length === 0) {
    return <p className="text-muted text-sm italic">No projects yet.</p>;
  }
  return (
    <div className="border-line border-t">
      {projects.map((p, i) => (
        <ProjectCard key={p.id} project={p} index={i} />
      ))}
    </div>
  );
}
