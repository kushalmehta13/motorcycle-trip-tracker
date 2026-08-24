"use server";

import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import type {
  Continent,
  LatLng,
  NamedStop,
  SavedTripStatus,
  TripCategory,
} from "@/db/schema";
import {
  CONTINENTS,
  SAVED_TRIP_STATUSES,
  TRIP_CATEGORIES,
  savedTrips,
  reviews,
  trips,
} from "@/db/schema";
import { getDb } from "@/db";
import { createTrip } from "@/lib/create-trip";
import { deriveGeoFromStops, routeFromStops } from "@/lib/routing";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

type TripFormInput = {
  name: string;
  category: TripCategory;
  continent?: string;
  country?: string;
  stateProvince?: string;
  region?: string;
  miles: number;
  durationHours: number;
  moodTag: string;
  description: string;
  difficulty: number;
  bestSeason?: string;
  stops: NamedStop[];
  route?: LatLng[];
};

function slugifyGeo(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateTripInput(input: TripFormInput): string | null {
  if (!input.name.trim() || !input.moodTag.trim() || !input.description.trim()) {
    return "Name, mood tag, and description are required.";
  }
  if (!TRIP_CATEGORIES.includes(input.category)) {
    return "Pick a valid category.";
  }
  if (
    input.continent?.trim() &&
    !CONTINENTS.includes(input.continent.trim() as never)
  ) {
    return "That continent isn't in the atlas yet.";
  }
  if (!Array.isArray(input.stops) || input.stops.length < 2) {
    return "Add at least two stops to build a route.";
  }
  if (input.route !== undefined) {
    if (!Array.isArray(input.route) || input.route.length < 2) {
      return "That imported track looks empty.";
    }
    if (input.route.length > 800) {
      return "That track is too long — try a trimmed GPX.";
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
        return "The imported track has invalid points.";
      }
    }
  }
  for (const stop of input.stops) {
    if (
      !stop.name?.trim() ||
      !Number.isFinite(stop.lat) ||
      !Number.isFinite(stop.lng) ||
      stop.lat < -90 ||
      stop.lat > 90 ||
      stop.lng < -180 ||
      stop.lng > 180
    ) {
      return "One of the stops looks invalid — remove it and try again.";
    }
  }
  if (!Number.isFinite(input.miles) || input.miles <= 0 || input.miles > 5000) {
    return "Mileage looks off.";
  }
  if (
    !Number.isFinite(input.durationHours) ||
    input.durationHours <= 0 ||
    input.durationHours > 100
  ) {
    return "Ride time looks off.";
  }
  if (!Number.isInteger(input.difficulty) || input.difficulty < 1 || input.difficulty > 5) {
    return "Difficulty must be 1–5.";
  }
  return null;
}

function cleanStops(stops: NamedStop[]): NamedStop[] {
  return stops.map((stop) => ({
    name: stop.name.trim().slice(0, 80),
    lat: Math.round(stop.lat * 10000) / 10000,
    lng: Math.round(stop.lng * 10000) / 10000,
  }));
}

export async function createTripAction(
  input: TripFormInput,
): Promise<ActionResult<{ slug: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in to share a ride." };
  }

  const error = validateTripInput(input);
  if (error) return { ok: false, error };

  const stops = cleanStops(input.stops);
  const { route } =
    input.route && input.route.length >= 2
      ? { route: input.route }
      : await routeFromStops(stops);

  const continent = input.continent?.trim()
    ? (slugifyGeo(input.continent) as Continent)
    : undefined;
  let country = input.country?.trim() ? slugifyGeo(input.country) : undefined;
  let stateProvince = input.stateProvince?.trim()
    ? slugifyGeo(input.stateProvince)
    : null;
  let region = input.region?.trim() ? slugifyGeo(input.region) : null;

  if (!continent || !country || !stateProvince) {
    const derived = await deriveGeoFromStops(stops);
    country = country ?? derived.country;
    stateProvince =
      stateProvince ?? derived.stateProvince ?? null;
    region = region ?? derived.region ?? null;
  }

  const trip = await createTrip({
    userId,
    name: input.name.trim(),
    category: input.category,
    continent,
    country,
    stateProvince,
    region,
    miles: Math.round(input.miles * 10) / 10,
    durationHours: Math.round(input.durationHours * 10) / 10,
    moodTag: input.moodTag.trim(),
    description: input.description.trim(),
    difficulty: input.difficulty,
    bestSeason: input.bestSeason?.trim() || null,
    stops,
    route,
  });

  revalidatePath("/");
  return { ok: true, data: { slug: trip.slug } };
}

export async function updateTripAction(
  tripId: number,
  input: TripFormInput,
): Promise<ActionResult<{ slug: string }>> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in first." };
  }

  const error = validateTripInput(input);
  if (error) return { ok: false, error };

  const db = getDb();
  const [existing] = await db
    .select({ id: trips.id, slug: trips.slug, userId: trips.userId })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "You can only edit rides you shared." };
  }

  const stops = cleanStops(input.stops);
  const { route } =
    input.route && input.route.length >= 2
      ? { route: input.route }
      : await routeFromStops(stops);

  let continent = input.continent?.trim()
    ? (slugifyGeo(input.continent) as Continent)
    : undefined;
  let country = input.country?.trim() ? slugifyGeo(input.country) : undefined;
  let stateProvince = input.stateProvince?.trim()
    ? slugifyGeo(input.stateProvince)
    : null;
  let region = input.region?.trim() ? slugifyGeo(input.region) : null;

  if (!continent || !country || !stateProvince) {
    const derived = await deriveGeoFromStops(stops);
    continent = (continent ?? derived.continent) as Continent | undefined;
    country = country ?? derived.country;
    stateProvince = stateProvince ?? derived.stateProvince ?? null;
    region = region ?? derived.region ?? null;
  }

  await db
    .update(trips)
    .set({
      name: input.name.trim(),
      category: input.category,
      continent: continent ?? null,
      country: country ?? null,
      stateProvince,
      region,
      miles: Math.round(input.miles * 10) / 10,
      durationHours: Math.round(input.durationHours * 10) / 10,
      moodTag: input.moodTag.trim(),
      description: input.description.trim(),
      difficulty: input.difficulty,
      bestSeason: input.bestSeason?.trim() || null,
      stops,
      route,
    })
    .where(eq(trips.id, tripId));

  revalidatePath("/");
  revalidatePath(`/trips/${existing.slug}`);
  return { ok: true, data: { slug: existing.slug } };
}

export async function toggleOutdatedAction(
  tripId: number,
): Promise<ActionResult<{ outdated: boolean }>> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Sign in first." };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: trips.id, outdatedAt: trips.outdatedAt })
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
    .limit(1);

  if (!existing) {
    return { ok: false, error: "You can only update rides you shared." };
  }

  const outdated = existing.outdatedAt === null;
  await db
    .update(trips)
    .set({ outdatedAt: outdated ? new Date() : null })
    .where(eq(trips.id, tripId));

  revalidatePath("/");
  return { ok: true, data: { outdated } };
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
