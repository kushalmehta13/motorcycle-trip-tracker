import Link from "next/link";
import CategoryFilter from "@/components/CategoryFilter";
import TripCard from "@/components/TripCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getTrips } from "@/lib/trips";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  let trips: Awaited<ReturnType<typeof getTrips>> = [];
  let error: string | null = null;

  try {
    trips = await getTrips({ category, q });
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Something went wrong loading trips.";
  }

  const totalMiles = Math.round(
    trips.reduce((sum, trip) => sum + trip.miles, 0),
  );
  const moodCount = new Set(trips.map((trip) => trip.moodTag)).size;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="catalog" />

      <main className="mx-auto w-full max-w-6xl grow px-4 pt-12 pb-20 sm:px-6">
        <section className="mb-10">
          <h1 className="font-display text-4xl leading-[1.02] uppercase sm:text-6xl">
            Every great ride
            <br />
            starts{" "}
            <span className="brutal-chip inline-block -rotate-1 bg-accent-pink px-3 py-1 text-paper">
              here
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base font-medium leading-relaxed">
            Community-built catalog of roads worth the detour — with maps,
            mileage, and honest ride reports.
          </p>

          {!error && trips.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              <StatChip label="Routes" value={String(trips.length)} />
              <StatChip label="Total miles" value={`${totalMiles} MI`} />
              <StatChip label="Moods" value={String(moodCount)} />
            </div>
          )}

          <div className="mt-8">
            <Link
              href="/add-ride"
              className="brutal-chip inline-block -rotate-1 bg-accent-teal px-4 py-2 font-display text-sm tracking-widest uppercase text-paper transition-transform duration-150 hover:-translate-y-0.5"
            >
              + Share a ride
            </Link>
          </div>

          <div className="mt-8">
            <CategoryFilter active={category} q={q} />
          </div>
        </section>

        {error && (
          <div className="brutal-card mb-10 bg-accent-orange p-5">
            <p className="font-bold tracking-wide uppercase">Database hiccup</p>
            <p className="mt-1 text-sm font-medium">{error}</p>
          </div>
        )}

        {!error && trips.length === 0 && (
          <div className="brutal-card flex flex-col items-start gap-3 border-dashed bg-white p-8">
            <h2 className="font-display text-xl uppercase">Nothing here yet</h2>
            <p className="text-sm font-medium">
              {category || q
                ? "No rides match that filter. Try another category or clear the search."
                : "The catalog is empty — be the first to share a ride."}
            </p>
          </div>
        )}

        <section
          aria-label="Trip catalog"
          className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
        >
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="brutal-chip bg-white px-4 py-2">
      <div className="font-display text-lg leading-none">{value}</div>
      <div className="mt-1 text-[10px] font-bold tracking-[0.18em] uppercase opacity-60">
        {label}
      </div>
    </div>
  );
}
