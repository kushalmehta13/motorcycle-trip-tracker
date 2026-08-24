import type { Metadata } from "next";
import Link from "next/link";
import BikeArt from "@/components/BikeArt";
import BikeCard from "@/components/BikeCard";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getBikes } from "@/lib/bikes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Garage — MOTO.TRACKER",
};

export default async function GaragePage() {
  let bikes: Awaited<ReturnType<typeof getBikes>> = [];
  let error: string | null = null;

  try {
    bikes = await getBikes();
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
              <BikeArt type="standard" accent="#FFD02F" seed="empty-garage" />
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
      </main>

      <SiteFooter />
    </div>
  );
}
