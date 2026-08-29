import Link from "next/link";
import CatalogControls from "@/components/CatalogControls";
import { slugToLabel as geoLabel } from "@/lib/labels";
import TripCard from "@/components/TripCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import {
  accentForTag,
  getGeoBuckets,
  getTrips,
  type GeoBucket,
  type TripSort,
} from "@/lib/trips";

export const dynamic = "force-dynamic";

type CatalogParams = {
  continent?: string;
  country?: string;
  state?: string;
  region?: string;
  category?: string;
  q?: string;
  sort?: string;
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<CatalogParams>;
}) {
  const params = await searchParams;
  const continent = params.continent;
  const country = params.country;
  const state = params.state;
  const region = params.region;
  const sort: TripSort =
    params.sort === "newest" || params.sort === "rating" || params.sort === "miles"
      ? params.sort
      : "popular";

  let trips: Awaited<ReturnType<typeof getTrips>> = [];
  let continents: GeoBucket[] = [];
  let countries: GeoBucket[] = [];
  let states: GeoBucket[] = [];
  let regions: GeoBucket[] = [];
  let error: string | null = null;

  try {
    [trips, continents, countries, states, regions] = await Promise.all([
      getTrips({ ...params, sort }),
      getGeoBuckets("continent", { q: params.q }),
      getGeoBuckets("country", { continent, q: params.q }),
      getGeoBuckets("state", { continent, country, q: params.q }),
      getGeoBuckets("region", { continent, country, state, q: params.q }),
    ]);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Something went wrong loading trips.";
  }

  const crumbs: { label: string; href: string }[] = [{ label: "Worldwide", href: "/" }];
  if (continent) {
    crumbs.push({
      label: geoLabel(continent),
      href: state || country ? `/?continent=${continent}` : "",
    });
  }
  if (country) {
    crumbs.push({
      label: geoLabel(country),
      href: state ? `/?continent=${continent}&country=${country}` : "",
    });
  }
  if (state) {
    crumbs.push({
      label: geoLabel(state),
      href: region ? `/?continent=${continent}&country=${country}&state=${state}` : "",
    });
  }
  if (region) {
    crumbs.push({
      label: geoLabel(region),
      href: `/?continent=${continent}&country=${country}&state=${state}&region=${region}`,
    });
  }

  function drillHref(level: "continent" | "country" | "state", value: string) {
    if (level === "continent") return `/?continent=${value}`;
    if (level === "country")
      return `/?continent=${continent}&country=${value}`;
    return `/?continent=${continent}&country=${country}&state=${value}`;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="catalog" />

      <main className="mx-auto w-full max-w-6xl grow px-4 pt-12 pb-20 sm:px-6">
        <section className="mb-8">
          <h1 className="font-display text-4xl leading-[1.02] uppercase sm:text-6xl">
            Ride{" "}
            <span className="brutal-chip inline-block bg-accent-pink px-3 py-1 text-paper">
              Collective
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base font-medium leading-relaxed">
            Community-built roads worth the detour. Drill down from continent
            to state and find your next ride.
          </p>

          {!error && trips.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-3">
              <div className="brutal-chip bg-white px-4 py-2">
                <div className="font-display text-lg leading-none">
                  {trips.length}
                </div>
                <div className="mt-1 text-[10px] font-bold tracking-[0.18em] uppercase opacity-60">
                  Routes
                </div>
              </div>
              <Link
                href="/add-ride"
                className="brutal-chip inline-block bg-accent-teal px-4 py-2 font-display text-sm tracking-widest uppercase text-paper transition-transform duration-150 hover:-translate-y-0.5"
              >
                + Share a ride
              </Link>
            </div>
          )}

          <nav aria-label="Geo breadcrumb" className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold tracking-[0.14em] uppercase">
            {crumbs.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">→</span>}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="opacity-60 transition-opacity hover:text-accent-pink hover:opacity-100"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="border-b-[3px] border-accent-pink pb-0.5">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          <div className="mt-4">
            <CatalogControls
              continents={continents}
              countries={countries}
              states={states}
              regions={regions}
              sort={sort}
            />
          </div>
        </section>

        {error && (
          <div className="brutal-card mb-10 bg-accent-orange p-5">
            <p className="font-bold tracking-wide uppercase">Database hiccup</p>
            <p className="mt-1 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Drill-down: continents */}
        {!error && !continent && continents.length > 0 && (
          <section aria-label="Browse by continent" className="mb-12">
            <h2 className="font-display mb-4 text-sm tracking-[0.18em] uppercase opacity-70">
              Pick a continent
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {continents.map(({ value, count }) => (
                <Link
                  key={value}
                  href={drillHref("continent", value)}
                  className="brutal-card flex flex-col items-start gap-1 bg-white p-4 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--color-ink)]"
                >
                  <span
                    className="inline-block h-2 w-10 border-2 border-ink"
                    style={{ backgroundColor: accentForTag(value) }}
                    aria-hidden="true"
                  />
                  <span className="font-display text-sm leading-tight uppercase">
                    {geoLabel(value)}
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase opacity-50">
                    {count} {count === 1 ? "ride" : "rides"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Drill-down: countries */}
        {!error && continent && !country && countries.length > 0 && (
          <section aria-label="Browse by country" className="mb-12">
            <h2 className="font-display mb-4 text-sm tracking-[0.18em] uppercase opacity-70">
              Countries in {geoLabel(continent)}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {countries.map(({ value, count }) => (
                <Link
                  key={value}
                  href={drillHref("country", value)}
                  className="brutal-card flex flex-col items-start gap-1 bg-white p-4 transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-[8px_8px_0_0_var(--color-ink)]"
                >
                  <span className="font-display text-sm leading-tight uppercase">
                    {geoLabel(value)}
                  </span>
                  <span className="text-[11px] font-bold tracking-widest uppercase opacity-50">
                    {count} {count === 1 ? "ride" : "rides"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Drill-down: states */}
        {!error && continent && country && !region && regions.length > 1 && (
          <section aria-label="Browse by area" className="mb-12">
            <h2 className="font-display mb-4 text-sm tracking-[0.18em] uppercase opacity-70">
              Areas in {geoLabel(state ?? "")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {regions.map(({ value, count }) => (
                <Link
                  key={value}
                  href={`/?continent=${continent}&country=${country}&state=${state}&region=${value}`}
                  className="brutal-chip bg-white px-3 py-2 text-xs font-bold uppercase transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {geoLabel(value)} ({count})
                </Link>
              ))}
            </div>
          </section>
        )}

        {!error && continent && country && !state && states.length > 1 && (
          <section aria-label="Browse by state or province" className="mb-12">
            <h2 className="font-display mb-4 text-sm tracking-[0.18em] uppercase opacity-70">
              States / provinces in {geoLabel(country ?? "")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {states.map(({ value, count }) => (
                <Link
                  key={value}
                  href={drillHref("state", value)}
                  className="brutal-chip bg-white px-3 py-2 text-xs font-bold uppercase transition-transform duration-150 hover:-translate-y-0.5"
                >
                  {geoLabel(value)} ({count})
                </Link>
              ))}
            </div>
          </section>
        )}

        {!error && trips.length === 0 && (
          <div className="brutal-card flex flex-col items-start gap-3 border-dashed bg-white p-8">
            <h2 className="font-display text-xl uppercase">Nothing here yet</h2>
            <p className="text-sm font-medium">
              {continent || country || state || params.category || params.q
                ? "No rides match those filters. Reset them or explore another region."
                : "No rides yet. Be the first to share one."}
            </p>
          </div>
        )}

        {!error && trips.length > 0 && (
          <section aria-label="Ride list">
            {(continent || country) && (
              <h2 className="font-display mb-6 text-sm tracking-[0.18em] uppercase opacity-70">
                {trips.length} {trips.length === 1 ? "ride" : "rides"} · sorted by{" "}
                {sort === "popular"
                  ? "popularity"
                  : sort === "rating"
                    ? "rating"
                    : sort === "miles"
                      ? "length"
                      : "date"}
              </h2>
            )}
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
