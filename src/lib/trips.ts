import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import {
  reviews,
  savedTrips,
  trips,
  type Review,
  type SavedTripStatus,
  type Trip,
} from "@/db/schema";

export type TripWithRating = Trip & {
  avgRating: number | null;
  reviewCount: number;
};

const tripColumns = {
  id: trips.id,
  slug: trips.slug,
  userId: trips.userId,
  name: trips.name,
  category: trips.category,
  miles: trips.miles,
  durationHours: trips.durationHours,
  moodTag: trips.moodTag,
  description: trips.description,
  difficulty: trips.difficulty,
  bestSeason: trips.bestSeason,
  route: trips.route,
  stops: trips.stops,
  outdatedAt: trips.outdatedAt,
  createdAt: trips.createdAt,
};

function baseQuery() {
  return getDb()
    .select({
      ...tripColumns,
      avgRating: sql<number | null>`avg(${reviews.rating})::float8`,
      reviewCount: sql<number>`count(${reviews.id})::int`,
    })
    .from(trips)
    .leftJoin(reviews, eq(reviews.tripId, trips.id))
    .groupBy(trips.id)
    .$dynamic();
}

export async function getTrips(options: {
  category?: string;
  q?: string;
} = {}): Promise<TripWithRating[]> {
  let query = baseQuery();

  const filters = [];
  if (options.category) {
    filters.push(eq(trips.category, options.category as TripWithRating["category"]));
  }
  if (options.q) {
    const pattern = `%${options.q}%`;
    filters.push(
      or(
        ilike(trips.name, pattern),
        ilike(trips.moodTag, pattern),
        ilike(trips.description, pattern),
      ),
    );
  }
  if (filters.length > 0) {
    query = query.where(and(...filters));
  }

  return query.orderBy(asc(trips.id));
}

export async function getTripBySlug(slug: string): Promise<TripWithRating | undefined> {
  const rows = await baseQuery().where(eq(trips.slug, slug)).limit(1);
  return rows[0];
}

export async function getTripReviews(tripId: number): Promise<Review[]> {
  const db = getDb();
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.tripId, tripId))
    .orderBy(desc(reviews.createdAt))
    .limit(20);
}

export async function getUserReview(
  userId: string,
  tripId: number,
): Promise<Review | undefined> {
  const db = getDb();
  const [review] = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.tripId, tripId)))
    .limit(1);
  return review;
}

export async function getUserSavedStatuses(
  userId: string,
  tripId: number,
): Promise<SavedTripStatus[]> {
  const db = getDb();
  const rows = await db
    .select({ status: savedTrips.status })
    .from(savedTrips)
    .where(and(eq(savedTrips.userId, userId), eq(savedTrips.tripId, tripId)));
  return rows.map((row) => row.status);
}

export async function getSavedTrips(userId: string): Promise<
  { status: SavedTripStatus; trip: Trip }[]
> {
  const db = getDb();
  return db
    .select({ status: savedTrips.status, trip: trips })
    .from(savedTrips)
    .innerJoin(trips, eq(savedTrips.tripId, trips.id))
    .where(eq(savedTrips.userId, userId))
    .orderBy(desc(savedTrips.createdAt));
}

export async function getTripByCreator(
  userId: string,
): Promise<TripWithRating[]> {
  return baseQuery()
    .where(eq(trips.userId, userId))
    .orderBy(desc(trips.createdAt));
}

export async function getTripById(id: number): Promise<Trip | undefined> {
  const db = getDb();
  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  return trip;
}

export function accentForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  const accents = ["#FFD02F", "#FF5D8F", "#2EC4B6", "#9D4EDD", "#FF8C42", "#06D6A0"];
  return accents[Math.abs(hash) % accents.length];
}
