import Link from "next/link";
import type { ReactNode } from "react";
import { LIBRARY_ROUTES } from "@/lib/routes";

/** Shell for the plain library routes. Server-rendered, no WebGL. */
export default function LibraryLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="absolute left-4 top-4 -translate-y-20 bg-surface px-3 py-2 text-sm focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <header className="border-b border-line">
        <nav
          aria-label="Site"
          className="mx-auto flex w-full max-w-3xl flex-wrap items-baseline gap-x-5 gap-y-2 px-6 py-5 text-sm"
        >
          <Link href="/" className="mr-auto font-mono text-xs uppercase tracking-widest text-accent">
            The Long Run
          </Link>
          {LIBRARY_ROUTES.map((route) => (
            <Link key={route.href} href={route.href} className="text-muted hover:text-ink">
              {route.label}
            </Link>
          ))}
        </nav>
      </header>
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
        {children}
      </main>
      <footer className="border-t border-line">
        <p className="mx-auto w-full max-w-3xl px-6 py-6 font-mono text-xs text-muted">
          Caleb the Curious. Chasing the sun.
        </p>
      </footer>
    </>
  );
}
