import TripCard from "@/components/TripCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getTrips } from "@/lib/trips";

export const dynamic = "force-dynamic";

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="brutal-chip bg-white px-4 py-2">
      <div className="font-display text-lg leading-none" style={{ color: "#161616" }}>
        {value}
      </div>
      <div
        className="mt-1 text-[10px] font-bold tracking-[0.18em] uppercase"
        style={{ color: "#161616" }}
      >
        {label}
        <span
          className="ml-1.5 inline-block h-2 w-2 border border-ink align-middle"
          style={{ backgroundColor: accent }}
        />
      </div>
    </div>
  );
}

export default async function HomePage() {
  let trips: Awaited<ReturnType<typeof getTrips>> = [];
  let error: string | null = null;

  try {
    trips = await getTrips();
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
        <section className="mb-14">
          <h1 className="font-display text-4xl leading-[1.02] uppercase sm:text-6xl">
            Every great ride
            <br />
            starts{" "}
            <span className="brutal-chip inline-block -rotate-1 bg-accent-pink px-3 py-1 text-paper">
              here
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base font-medium leading-relaxed">
            Hand-picked routes worth the detour — with maps, mileage, and an
            honest heads-up on what you&apos;re in for.
          </p>

          {!error && trips.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              <StatBox label="Routes" value={String(trips.length)} accent="#FFD02F" />
              <StatBox label="Total miles" value={`${totalMiles} MI`} accent="#FF5D8F" />
              <StatBox label="Moods" value={String(moodCount)} accent="#2EC4B6" />
            </div>
          )}
        </section>

        {error && (
          <div className="brutal-card mb-10 bg-accent-orange p-5">
            <p className="font-bold tracking-wide uppercase">Database hiccup</p>
            <p className="mt-1 text-sm font-medium">{error}</p>
          </div>
        )}

        {!error && trips.length === 0 && (
          <div className="brutal-card flex flex-col items-start gap-3 border-dashed bg-white p-8">
            <h2 className="font-display text-xl uppercase">No trips yet</h2>
            <p className="text-sm font-medium">
              The catalog is empty. Run{" "}
              <code className="border border-ink bg-paper px-1.5 py-0.5 font-mono text-xs">
                npm run db:push
              </code>{" "}
              then{" "}
              <code className="border border-ink bg-paper px-1.5 py-0.5 font-mono text-xs">
                npm run db:seed
              </code>{" "}
              to load sample rides.
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
