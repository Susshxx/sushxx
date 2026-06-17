import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

const THEME_BOOT = `(() => {
  try {
    const stored = localStorage.getItem("sush-theme");
    const theme = stored === "light" ? "light" : "dark";
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {
    document.documentElement.classList.add("dark");
  }
})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-fg">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <p className="mt-3 text-sm text-muted">This page wandered off.</p>
        <div className="mt-6">
          <Link to="/" className="underline underline-offset-4 hover:opacity-70">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 text-fg">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Something broke</h1>
        <p className="mt-2 text-sm text-muted">Try again or head home.</p>
        <div className="mt-6 flex justify-center gap-3 text-sm">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="underline underline-offset-4 hover:opacity-70"
          >
            Try again
          </button>
          <a href="/" className="underline underline-offset-4 hover:opacity-70">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sush — Designing. Building. Shipping." },
      {
        name: "description",
        content:
          "Portfolio of Sush — design and engineering work across product, brand, and motion.",
      },
      { name: "author", content: "Sush" },
      { property: "og:title", content: "Sush — Designing. Building. Shipping." },
      {
        property: "og:description",
        content: "Selected projects and experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="bottom-center" theme="dark" />
    </QueryClientProvider>
  );
}
