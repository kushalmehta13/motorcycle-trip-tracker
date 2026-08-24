import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import ModalShell from "@/components/ModalShell";
import TripDetail from "@/components/TripDetail";
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
    <ModalShell>
      <TripDetail
        trip={trip}
        reviews={tripReviews}
        userReview={userReview ?? null}
        savedStatuses={savedStatuses ?? []}
        isSignedIn={Boolean(userId)}
      />
    </ModalShell>
  );
}
