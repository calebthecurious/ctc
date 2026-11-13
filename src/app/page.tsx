import Link from "next/link";
import { LIBRARY_ROUTES } from "@/lib/routes";

// PLACEHOLDER: the run (Step 3) replaces this page. Until then it is the plain index.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">The Long Run</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">Caleb the Curious</h1>
      <p className="mt-3 text-sm text-muted">
        Developer, ultra trail runner, storyteller. One continuous run through four decades.
      </p>
      <nav aria-label="Library" className="mt-12">
        <ul className="border-t border-line">
          {LIBRARY_ROUTES.map((route) => (
            <li key={route.href} className="border-b border-line">
              <Link href={route.href} className="group grid gap-x-4 py-3 text-sm sm:grid-cols-[6.5rem_1fr]">
                <span className="group-hover:text-accent">{route.label}</span>
                <span className="text-muted">{route.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
