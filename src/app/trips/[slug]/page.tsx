import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import TripDetail from "@/components/TripDetail";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import {
  getTripBySlug,
  getTripReviews,
  getUserReview,
  getUserSavedStatuses,
} from "@/lib/trips";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();

  const trip = await getTripBySlug(slug);
  if (!trip) {
    notFound();
  }

  const [tripReviews, userReview, savedStatuses] = userId
    ? await Promise.all([
        getTripReviews(trip.id),
        getUserReview(userId, trip.id),
        getUserSavedStatuses(userId, trip.id),
      ])
    : [await getTripReviews(trip.id), undefined, undefined];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="catalog" />

      <main className="mx-auto w-full max-w-2xl grow px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-60 transition-opacity hover:opacity-100"
        >
          ← All trips
        </Link>

        <div className="brutal-card mt-4 bg-paper shadow-[10px_10px_0_0_var(--color-ink)]">
          <TripDetail
            trip={trip}
            reviews={tripReviews}
            userReview={userReview ?? null}
            savedStatuses={savedStatuses ?? []}
            isSignedIn={Boolean(userId)}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
