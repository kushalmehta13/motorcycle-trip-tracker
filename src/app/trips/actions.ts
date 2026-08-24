"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import type { LatLng } from "@/db/schema";
import {
  SAVED_TRIP_STATUSES,
  TRIP_CATEGORIES,
  savedTrips,
  reviews,
  type SavedTripStatus,
  type TripCategory,
} from "@/db/schema";
import { getDb } from "@/db";
import { createTrip } from "@/lib/create-trip";

type CreateTripInput = {
  name: string;
  category: TripCategory;
  miles: number;
  durationHours: number;
  moodTag: string;
  description: string;
  difficulty: number;
  bestSeason?: string;
  route: LatLng[];
};

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

export async function createTripAction(
  input: CreateTripInput,
): Promise<ActionResult<{ slug: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in to share a ride." };
  }

  const name = input.name.trim();
  const moodTag = input.moodTag.trim();
  const description = input.description.trim();

  if (!name || !moodTag || !description) {
    return { ok: false, error: "Name, mood tag, and description are required." };
  }
  if (!TRIP_CATEGORIES.includes(input.category)) {
    return { ok: false, error: "Pick a valid category." };
  }
  if (!Array.isArray(input.route) || input.route.length < 2) {
    return { ok: false, error: "Plot at least two points on the map." };
  }
  for (const [lat, lng] of input.route) {
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return { ok: false, error: "Route points look invalid." };
    }
  }
  if (!Number.isFinite(input.miles) || input.miles <= 0 || input.miles > 5000) {
    return { ok: false, error: "Mileage looks off." };
  }
  if (
    !Number.isFinite(input.durationHours) ||
    input.durationHours <= 0 ||
    input.durationHours > 100
  ) {
    return { ok: false, error: "Ride time looks off." };
  }
  if (!Number.isInteger(input.difficulty) || input.difficulty < 1 || input.difficulty > 5) {
    return { ok: false, error: "Difficulty must be 1–5." };
  }

  const trip = await createTrip({
    userId,
    name,
    category: input.category,
    miles: Math.round(input.miles * 10) / 10,
    durationHours: Math.round(input.durationHours * 10) / 10,
    moodTag,
    description,
    difficulty: input.difficulty,
    bestSeason: input.bestSeason?.trim() || null,
    route: input.route,
  });

  revalidatePath("/");
  return { ok: true, data: { slug: trip.slug } };
}

export async function toggleSavedTripAction(
  tripId: number,
  status: SavedTripStatus,
): Promise<ActionResult<{ saved: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in to save rides." };
  }
  if (!SAVED_TRIP_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid list." };
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(savedTrips)
    .where(and(eq(savedTrips.userId, userId), eq(savedTrips.tripId, tripId)))
    .limit(1);

  if (!existing) {
    await db.insert(savedTrips).values({ userId, tripId, status });
    return { ok: true, data: { saved: true } };
  }

  if (existing.status === status) {
    await db.delete(savedTrips).where(eq(savedTrips.id, existing.id));
    return { ok: true, data: { saved: false } };
  }

  await db
    .update(savedTrips)
    .set({ status })
    .where(eq(savedTrips.id, existing.id));
  return { ok: true, data: { saved: true } };
}

export async function submitReviewAction(
  tripId: number,
  rating: number,
  comment: string,
): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in to review rides." };
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be 1–5 blocks." };
  }

  const user = await currentUser();
  const reviewerName =
    user?.firstName ?? user?.username ?? `Rider ${userId.slice(-4)}`;

  const db = getDb();
  await db
    .insert(reviews)
    .values({
      tripId,
      userId,
      reviewerName,
      rating,
      comment: comment.trim().slice(0, 600) || null,
    })
    .onConflictDoUpdate({
      target: [reviews.tripId, reviews.userId],
      set: {
        rating,
        comment: comment.trim().slice(0, 600) || null,
        reviewerName,
        createdAt: new Date(),
      },
    });

  revalidatePath("/");
  return { ok: true };
}
