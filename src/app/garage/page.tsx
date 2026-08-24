import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import BikeArt from "@/components/BikeArt";
import BikeCard from "@/components/BikeCard";
import RemoveSavedButton from "@/components/RemoveSavedButton";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getBikes, resolvePhotoUrls } from "@/lib/bikes";
import { getSavedTrips } from "@/lib/trips";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Garage — MOTO.TRACKER",
};

export default async function GaragePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  let bikes: Awaited<ReturnType<typeof getBikes>> = [];
  let saved: Awaited<ReturnType<typeof getSavedTrips>> = [];
  let error: string | null = null;

  try {
    bikes = await resolvePhotoUrls(await getBikes(userId));
    saved = await getSavedTrips(userId);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Something went wrong loading the garage.";
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="garage" />

      <main className="mx-auto w-full max-w-6xl grow px-4 pt-12 pb-20 sm:px-6 sm:pt-14">
        <section className="mb-12">
          <h1 className="font-display text-4xl leading-[1.02] uppercase sm:text-6xl">
            The{" "}
            <span className="brutal-chip inline-block -rotate-1 bg-accent-teal px-3 py-1 text-paper">
              garage
            </span>
          </h1>
          <p className="mt-6 max-w-md text-base font-medium leading-relaxed">
            The machines that get you there. Keep the odometer honest.
          </p>
        </section>

        <Link
          href="/garage/new"
          className="brutal-card mb-10 flex items-center justify-center gap-3 border-dashed bg-white px-4 py-5 font-display text-sm tracking-widest uppercase transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_var(--color-ink)]"
        >
          <span className="flex h-7 w-7 items-center justify-center border-2 border-ink bg-accent-yellow text-base leading-none">
            +
          </span>
          Add a bike
        </Link>

        {error && (
          <div className="brutal-card mb-10 bg-accent-orange p-5">
            <p className="font-bold tracking-wide uppercase">Database hiccup</p>
            <p className="mt-1 text-sm font-medium">{error}</p>
          </div>
        )}

        {!error && bikes.length === 0 && (
          <div className="brutal-card flex flex-col items-center gap-2 border-dashed bg-white px-6 py-14 text-center">
            <div className="h-44 w-full max-w-sm opacity-90">
              <BikeArt type="standard" accent="#FFD02F" />
            </div>
            <h2 className="font-display mt-3 text-xl uppercase">No bikes yet</h2>
            <p className="max-w-xs text-sm font-medium opacity-70">
              Every rider starts with one. Add your first machine above.
            </p>
          </div>
        )}

        <section
          aria-label="Your bikes"
          className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3"
        >
          {bikes.map((bike) => (
            <BikeCard key={bike.id} bike={bike} />
          ))}
        </section>

        <section aria-label="Saved trips" className="mt-16">
          <h2 className="font-display text-2xl uppercase sm:text-3xl">
            Trips to{" "}
            <span className="brutal-chip inline-block -rotate-1 bg-accent-pink px-3 py-0.5 text-paper">
              ride
            </span>
          </h2>

          {!error && saved.length === 0 ? (
            <div className="brutal-card mt-6 border-dashed bg-white p-6 text-sm font-medium opacity-70">
              Nothing saved yet. Browse the{" "}
              <Link
                href="/"
                className="underline decoration-2 underline-offset-2"
              >
                catalog
              </Link>{" "}
              and stash rides on your wishlist or mark them as planned.
            </div>
          ) : (
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              {(["wishlist", "upcoming"] as const).map((status) => {
                const group = saved.filter((entry) => entry.status === status);
                return (
                  <div key={status} className="brutal-card bg-white p-5">
                    <h3 className="font-display text-sm tracking-widest uppercase">
                      {status === "wishlist" ? "Wishlist" : "Planned rides"}
                      <span className="ml-2 border-2 border-ink bg-paper px-1.5 py-0.5 text-[10px]">
                        {group.length}
                      </span>
                    </h3>
                    {group.length === 0 ? (
                      <p className="mt-3 text-xs font-medium opacity-60">
                        Empty for now.
                      </p>
                    ) : (
                      <ul className="mt-4 flex flex-col gap-3">
                        {group.map(({ trip }) => (
                          <li
                            key={trip.id}
                            className="flex items-center gap-3 border-b-2 border-dashed border-ink/20 pb-3 last:border-0 last:pb-0"
                          >
                            <Link
                              href={`/trips/${trip.slug}`}
                              className="grow text-sm font-bold hover:underline"
                            >
                              {trip.name}
                              <span className="ml-2 text-[10px] font-medium tracking-widest uppercase opacity-50">
                                {Math.round(trip.miles)} mi
                              </span>
                            </Link>
                            <RemoveSavedButton tripId={trip.id} status={status} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
