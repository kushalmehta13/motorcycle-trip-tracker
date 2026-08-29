import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import CommunityTripForm from "@/components/CommunityTripForm";
import OutdatedToggle from "@/components/OutdatedToggle";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { getTripBySlug } from "@/lib/trips";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit ride · Ride Collective",
};

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/trips/${slug}/edit`);
  }

  const trip = await getTripBySlug(slug);
  if (!trip) notFound();

  if (trip.userId !== userId) {
    redirect(`/trips/${slug}`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="catalog" />

      <main className="mx-auto w-full max-w-3xl grow px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <Link
          href={`/trips/${slug}`}
          className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-60 transition-opacity hover:opacity-100"
        >
          ← Back to ride
        </Link>

        <h1 className="font-display mt-4 mb-8 text-3xl leading-tight uppercase sm:text-5xl">
          Edit{" "}
          <span className="brutal-chip inline-block bg-accent-teal px-3 py-0.5 text-paper">
            ride
          </span>
        </h1>

        <div className="mb-6">
          <OutdatedToggle tripId={trip.id} initialOutdated={trip.outdatedAt !== null} />
        </div>

        <CommunityTripForm
          mode="edit"
          tripId={trip.id}
          initial={{
            name: trip.name,
            category: trip.category,
            continent: trip.continent,
            country: trip.country,
            stateProvince: trip.stateProvince,
            moodTag: trip.moodTag,
            description: trip.description,
            miles: trip.miles,
            durationHours: trip.durationHours,
            difficulty: trip.difficulty,
            bestSeason: trip.bestSeason,
            stops: trip.stops ?? [],
            route: trip.route,
          }}
        />
      </main>

      <SiteFooter />
    </div>
  );
}

