"use client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Tables } from "@/integrations/supabase/types";
import { listExperiences } from "@/lib/experiences.functions";
import { isAdmin as isAdminFn } from "@/lib/admin.functions";
import { ExperienceRow } from "./ExperienceRow";

export function ExperienceList({ initial }: { initial: Tables<"experiences">[] }) {
  const list = useServerFn(listExperiences);
  const admin = useServerFn(isAdminFn);

  const expQ = useQuery({
    queryKey: ["experiences"],
    queryFn: () => list(),
    initialData: { experiences: initial },
  });

  const adminQ = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => admin(),
    staleTime: 60_000,
  });

  return (
    <div>
      {expQ.data.experiences.map((e) => (
        <ExperienceRow
          key={e.id}
          experience={e}
          isAdmin={!!adminQ.data?.admin}
          onChanged={() => expQ.refetch()}
        />
      ))}
    </div>
  );
}
