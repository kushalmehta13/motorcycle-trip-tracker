import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import {
  reviews,
  savedTrips,
  trips,
  type Continent,
  type Review,
  type SavedTripStatus,
  type Trip,
} from "@/db/schema";

export type TripWithRating = Trip & {
  avgRating: number | null;
  reviewCount: number;
  saves: number;
  popularity: number;
};

export type GeoBucket = { value: string; count: number };

export type TripSort = "popular" | "newest" | "rating" | "miles";

const popularityExpr = sql<number>`(
  (select count(*) from saved_trips s where s.trip_id = ${trips.id})
  + (select count(*) from reviews r where r.trip_id = ${trips.id})
)::int`;

const avgExpr = sql<number | null>`(select avg(r.rating)::float8 from reviews r where r.trip_id = ${trips.id})`;
const reviewCountExpr = sql<number>`(select count(*)::int from reviews r where r.trip_id = ${trips.id})`;

const tripColumns = {
  id: trips.id,
  slug: trips.slug,
  userId: trips.userId,
  name: trips.name,
  category: trips.category,
  continent: trips.continent,
  country: trips.country,
  stateProvince: trips.stateProvince,
  region: trips.region,
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
      avgRating: avgExpr,
      reviewCount: reviewCountExpr,
      saves: sql<number>`(select count(*)::int from saved_trips s where s.trip_id = ${trips.id})`,
      popularity: popularityExpr,
    })
    .from(trips)
    .$dynamic();
}

export type TripFilters = {
  continent?: string;
  country?: string;
  state?: string;
  region?: string;
  category?: string;
  q?: string;
};

function filterConditions(filters: TripFilters): SQL[] {
  const conditions: SQL[] = [];
  if (filters.continent) {
    conditions.push(eq(trips.continent, filters.continent as Continent));
  }
  if (filters.country) {
    conditions.push(eq(trips.country, filters.country));
  }
  if (filters.state) {
    conditions.push(eq(trips.stateProvince, filters.state));
  }
  if (filters.region) {
    conditions.push(eq(trips.region, filters.region));
  }
  if (filters.category) {
    conditions.push(eq(trips.category, filters.category as Trip["category"]));
  }
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    const search = or(
      ilike(trips.name, pattern),
      ilike(trips.moodTag, pattern),
      ilike(trips.description, pattern),
      ilike(trips.country, pattern),
      ilike(trips.stateProvince, pattern),
    );
    if (search) conditions.push(search);
  }
  return conditions;
}

function orderFor(sort: TripSort): SQL[] {
  switch (sort) {
    case "newest":
      return [desc(trips.createdAt)];
    case "rating":
      return [
        desc(sql`coalesce(${avgExpr}, -1)`),
        desc(reviewCountExpr),
        desc(popularityExpr),
      ];
    case "miles":
      return [asc(trips.miles)];
    case "popular":
    default:
      return [desc(popularityExpr), desc(reviewCountExpr), asc(trips.name)];
  }
}

export async function getTrips(
  filters: TripFilters & { sort?: TripSort } = {},
): Promise<TripWithRating[]> {
  let query = baseQuery();

  const conditions = filterConditions(filters);
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(...orderFor(filters.sort ?? "popular"));
}

export async function getTripBySlug(
  slug: string,
): Promise<TripWithRating | undefined> {
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

export async function getGeoBuckets(
  level: "continent" | "country" | "state" | "region",
  scope: {
    continent?: string;
    country?: string;
    state?: string;
    q?: string;
  } = {},
): Promise<GeoBucket[]> {
  const db = getDb();

  const column =
    level === "continent"
      ? trips.continent
      : level === "country"
        ? trips.country
        : level === "state"
          ? trips.stateProvince
          : trips.region;

  let query = db
    .select({
      value: column,
      count: sql<number>`count(*)::int`,
    })
    .from(trips)
    .$dynamic();

  const conditions: SQL[] = [];
  if (level !== "continent") {
    if (scope.continent)
      conditions.push(eq(trips.continent, scope.continent as Continent));
    else conditions.push(sql`${trips.continent} is not null`);
  }
  if (level === "state" || level === "region") {
    if (scope.country) conditions.push(eq(trips.country, scope.country));
    else conditions.push(sql`${trips.country} is not null`);
  }
  if (level === "region") {
    if (scope.state) conditions.push(eq(trips.stateProvince, scope.state));
    else conditions.push(sql`${trips.stateProvince} is not null`);
  }
  if (scope.q) {
    const pattern = `%${scope.q}%`;
    const search = or(ilike(trips.name, pattern), ilike(trips.moodTag, pattern));
    if (search) conditions.push(search);
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const rows = await query.groupBy(column);

  return rows
    .filter((row): row is { value: string; count: number } => Boolean(row.value))
    .map((row) => ({ value: row.value as string, count: Number(row.count) }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export function accentForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  const accents = ["#FFD02F", "#FF5D8F", "#2EC4B6", "#9D4EDD", "#FF8C42", "#06D6A0"];
  return accents[Math.abs(hash) % accents.length];
}
