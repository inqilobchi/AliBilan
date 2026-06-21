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
import { ThemeProvider } from "../lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-sky px-4">
      <div className="max-w-md text-center bg-card rounded-3xl p-8 shadow-pop">
        <div className="text-7xl mb-2">🤔</div>
        <h1 className="text-4xl font-bold">Bu sahifa yo'q</h1>
        <p className="mt-2 text-muted-foreground">Ali sen bilan uyga qaytmoqchi!</p>
        <Link to="/" className="inline-block mt-6 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl shadow-pop">
          🏠 Bosh sahifa
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-sky px-4">
      <div className="max-w-md text-center bg-card rounded-3xl p-8 shadow-pop">
        <div className="text-7xl mb-2">😅</div>
        <h1 className="text-2xl font-bold">Ups, biror narsa noto'g'ri ketdi</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-2xl shadow-pop"
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" },
      { name: "theme-color", content: "#60a5fa" },
      { title: "Ali bilan o'yna — bolalar uchun ta'limiy o'yinlar" },
      { name: "description", content: "Ali bilan birga o'rganing: ranglar, raqamlar, harflar, xotira o'yinlari va so'z topish. Offline ishlaydi." },
      { property: "og:title", content: "Ali bilan o'yna" },
      { property: "og:description", content: "Bolalar uchun qiziqarli ta'limiy o'yinlar — Ali hamrohligida." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" data-theme="boy">
      <head><HeadContent /></head>
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
      <ThemeProvider>
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
