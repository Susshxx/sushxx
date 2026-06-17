import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getProjectBySlug } from "@/lib/projects.functions";
import { ThemeToggleDot } from "@/components/site/ThemeToggleDot";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ params }) => {
    const { project } = await getProjectBySlug({ data: { slug: params.slug } });
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    if (!p) return { meta: [{ title: "Project — Sush" }] };
    const desc = p.description?.slice(0, 160) || `${p.title} — a project by Sush.`;
    return {
      meta: [
        { title: `${p.title} — Sush` },
        { name: "description", content: desc },
        { property: "og:title", content: `${p.title} — Sush` },
        { property: "og:description", content: desc },
        ...(p.cover_url ? [{ property: "og:image", content: p.cover_url }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="bg-bg text-fg flex min-h-screen items-center justify-center p-10">
      <div className="text-center">
        <h1 className="font-display text-5xl italic">Not found</h1>
        <Link to="/" className="text-muted hover:text-fg mt-4 inline-block underline">
          Back home
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="bg-bg text-fg flex min-h-screen items-center justify-center p-10">
      <p className="text-muted text-sm">{error.message}</p>
    </div>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  return (
    <main className="bg-bg text-fg min-h-screen">
      <ThemeToggleDot />
      <div className="px-6 py-10 sm:px-10">
        <Link
          to="/"
          className="text-muted hover:text-fg text-xs uppercase tracking-[0.18em]"
        >
          ← Back
        </Link>
      </div>

      <article className="mx-auto max-w-5xl px-6 pb-24 sm:px-10">
        <header className="mb-12">
          <h1 className="font-display text-5xl italic md:text-7xl">{project.title}</h1>
          {project.tech.length > 0 ? (
            <p className="text-muted mt-4 text-sm uppercase tracking-[0.18em]">
              {project.tech.join(" · ")}
            </p>
          ) : null}
        </header>

        <div className="bg-card relative aspect-video w-full overflow-hidden rounded-md">
          {project.video_url ? (
            <video
              src={project.video_url}
              autoPlay
              muted
              loop
              playsInline
              poster={project.cover_url ?? undefined}
              className="h-full w-full object-cover"
            />
          ) : project.cover_url ? (
            <img
              src={project.cover_url}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-fg/20 text-9xl italic">
                {project.title.slice(0, 1)}
              </span>
            </div>
          )}
        </div>

        {project.description ? (
          <div className="mt-12 max-w-2xl">
            <p className="text-fg/85 whitespace-pre-line text-lg leading-relaxed">
              {project.description}
            </p>
          </div>
        ) : null}

        {project.link_url ? (
          <div className="mt-10">
            <a
              href={project.link_url}
              target="_blank"
              rel="noreferrer"
              className="bg-fg text-bg inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em]"
            >
              Visit project ↗
            </a>
          </div>
        ) : null}
      </article>

      <Footer />
    </main>
  );
}
