import { createFileRoute } from "@tanstack/react-router";
import { listProjects } from "@/lib/projects.functions";
import { listExperiences } from "@/lib/experiences.functions";
import { getSectionsVisibility, getSiteSettings } from "@/lib/settings.functions";
import { HeroStage } from "@/components/site/hero/HeroStage";
import { ThemeToggleDot } from "@/components/site/ThemeToggleDot";
import { ProjectGrid } from "@/components/site/grid/ProjectGrid";
import { ExperienceList } from "@/components/site/experience/ExperienceList";
import { ContactForm } from "@/components/site/contact/ContactForm";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sush — Designing. Building. Shipping." },
      {
        name: "description",
        content:
          "Sush is a designer and engineer. Selected projects, experience, and how to get in touch.",
      },
      { property: "og:title", content: "Sush — Designing. Building. Shipping." },
      {
        property: "og:description",
        content: "Selected projects, experience, and how to get in touch.",
      },
    ],
  }),
  loader: async () => {
    const [projects, experiences, sections, site] = await Promise.all([
      listProjects(),
      listExperiences(),
      getSectionsVisibility(),
      getSiteSettings(),
    ]);
    return {
      projects: projects.projects,
      experiences: experiences.experiences,
      visibility: sections.visibility,
      site: site.settings,
    };
  },
  errorComponent: ({ error }) => (
    <div className="bg-bg text-fg flex min-h-screen items-center justify-center p-10">
      <p className="text-muted text-sm">Could not load the site: {error.message}</p>
    </div>
  ),
  component: Index,
});

function Index() {
  const { projects, experiences, visibility, site } = Route.useLoaderData();

  return (
    <main className="bg-bg text-fg relative">
      <ThemeToggleDot />
      <HeroStage projects={projects} hero={site.hero} />


      {visibility.projects ? (
        <section id="projects" className="border-line border-t px-6 py-24 sm:px-10 md:py-32">
          <div className="mx-auto max-w-6xl">
            <header className="mb-12 flex items-baseline justify-between">
              <h2 className="font-display text-4xl italic md:text-5xl">Selected work</h2>
              <span className="text-muted text-xs uppercase tracking-[0.18em]">
                {String(projects.length).padStart(2, "0")} projects
              </span>
            </header>
            <ProjectGrid projects={projects} />
          </div>
        </section>
      ) : null}

      {visibility.experience ? (
        <section id="experience" className="border-line border-t px-6 py-24 sm:px-10 md:py-32">
          <div className="mx-auto max-w-6xl">
            <header className="mb-12 flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="font-display text-4xl italic md:text-5xl">Experience</h2>
              <div className="flex items-center gap-4">
                {site.resume_url ? (
                  <a
                    href={site.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-line hover:bg-fg hover:text-bg rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors"
                  >
                    Download résumé ↓
                  </a>
                ) : null}
                <span className="text-muted text-xs uppercase tracking-[0.18em]">
                  A working timeline
                </span>
              </div>
            </header>
            <ExperienceList initial={experiences} />
          </div>
        </section>
      ) : null}

      {visibility.contact ? (
        <section id="contact" className="border-line border-t px-6 py-24 sm:px-10 md:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-muted mb-6 text-xs uppercase tracking-[0.28em]">Reach out</p>
            <h2 className="font-display text-5xl italic md:text-7xl">
              Let&apos;s build something.
            </h2>
            <div className="mt-16 text-left">
              <ContactForm />
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  );
}
