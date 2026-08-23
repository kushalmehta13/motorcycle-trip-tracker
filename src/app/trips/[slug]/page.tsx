import Link from "next/link";
import { notFound } from "next/navigation";
import TripDetail from "@/components/TripDetail";
import { getTripBySlug } from "@/lib/trips";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b-4 border-ink bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="brutal-chip inline-block -rotate-2 bg-accent-yellow px-2 py-1 font-display text-base leading-none">
              MOTO
            </span>
            <span className="font-display text-lg tracking-tight">TRACKER</span>
          </Link>
          <Link
            href="/"
            className="brutal-chip bg-white px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5"
          >
            ← All trips
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl grow px-4 py-8 sm:px-6 sm:py-12">
        <div className="brutal-card bg-paper shadow-[10px_10px_0_0_var(--color-ink)]">
          <TripDetail trip={trip} />
        </div>
      </main>

      <footer className="border-t-4 border-ink bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[11px] font-bold tracking-[0.18em] uppercase sm:px-6">
          <span>MOTO.TRACKER © 2026</span>
          <span className="opacity-70">Built for the long way home</span>
        </div>
      </footer>
    </div>
  );
}
