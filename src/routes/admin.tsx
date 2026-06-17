import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { isAdmin, adminSignOut } from "@/lib/admin.functions";
import { listProjects } from "@/lib/projects.functions";
import { listExperiences } from "@/lib/experiences.functions";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { ProjectsTable } from "@/components/admin/ProjectsTable";
import { ExperiencesTable } from "@/components/admin/ExperiencesTable";
import { MessagesTable } from "@/components/admin/MessagesTable";
import { SectionsPanel } from "@/components/admin/SectionsPanel";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Sush" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Tab = "projects" | "experience" | "messages" | "sections";

function AdminPage() {
  const check = useServerFn(isAdmin);
  const out = useServerFn(adminSignOut);
  const session = useQuery({ queryKey: ["adminSession"], queryFn: () => check() });

  if (session.isLoading) {
    return (
      <main className="bg-bg text-fg flex min-h-screen items-center justify-center">
        <p className="text-muted text-sm">Checking session…</p>
      </main>
    );
  }

  if (!session.data?.admin) {
    return (
      <main className="bg-bg text-fg min-h-screen px-4">
        <AdminLogin onSuccess={() => session.refetch()} />
      </main>
    );
  }

  return (
    <AdminAuthed
      onSignOut={async () => {
        await out();
        toast.success("Signed out");
        session.refetch();
      }}
    />
  );
}

function AdminAuthed({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<Tab>("projects");
  const listP = useServerFn(listProjects);
  const listE = useServerFn(listExperiences);
  const pQ = useQuery({ queryKey: ["adminProjects"], queryFn: () => listP() });
  const eQ = useQuery({ queryKey: ["adminExperiences"], queryFn: () => listE() });

  const tabs: { id: Tab; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "messages", label: "Messages" },
    { id: "sections", label: "Sections" },
  ];

  return (
    <main className="bg-bg text-fg min-h-screen px-6 py-10 sm:px-10">
      <header className="mx-auto mb-8 flex max-w-5xl items-center justify-between">
        <h1 className="font-display text-3xl italic">Admin</h1>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-muted hover:text-fg underline-offset-4 hover:underline">
            View site ↗
          </Link>
          <button
            onClick={onSignOut}
            className="text-muted hover:text-fg underline-offset-4 hover:underline"
          >
            Sign out
          </button>
        </div>
      </header>

      <nav className="border-line mx-auto mb-8 flex max-w-5xl gap-1 border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm uppercase tracking-wider ${
              tab === t.id
                ? "border-fg text-fg"
                : "text-muted hover:text-fg border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="mx-auto max-w-5xl">
        {tab === "projects" ? (
          <ProjectsTable
            projects={pQ.data?.projects ?? []}
            onChanged={() => pQ.refetch()}
          />
        ) : null}
        {tab === "experience" ? (
          <ExperiencesTable
            experiences={eQ.data?.experiences ?? []}
            onChanged={() => eQ.refetch()}
          />
        ) : null}
        {tab === "messages" ? <MessagesTable /> : null}
        {tab === "sections" ? <SectionsPanel /> : null}
      </div>
    </main>
  );
}
