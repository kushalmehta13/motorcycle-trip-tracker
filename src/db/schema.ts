import {
  pgTable,
  real,
  serial,
  text,
  timestamp,
  jsonb,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export type LatLng = [number, number];

export const MOOD_TAGS = [
  "Coastal Cruise",
  "Forest Glide",
  "Hairpin Heaven",
  "High Desert Sweepers",
  "Long Haul Highway",
  "Mountain Passes",
  "Off-Road Adventure",
  "Scenic Chill",
  "Sunset Cruiser",
  "Twisty & Technical",
] as const;;

export type MoodTag = (typeof MOOD_TAGS)[number];

export const TRIP_CATEGORIES = [
  "canyon",
  "coastal",
  "desert",
  "forest",
  "mixed",
  "mountain",
] as const;;

export type TripCategory = (typeof TRIP_CATEGORIES)[number];

export type NamedStop = {
  name: string;
  lat: number;
  lng: number;
};

export const CONTINENTS = [
  "africa",
  "asia",
  "europe",
  "north-america",
  "oceania",
  "south-america",
] as const;;

export type Continent = (typeof CONTINENTS)[number];

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  userId: text("user_id"),
  name: text("name").notNull(),
  category: text("category")
    .$type<TripCategory>()
    .notNull()
    .default("mixed"),
  continent: text("continent").$type<Continent>(),
  country: text("country"),
  stateProvince: text("state_province"),
  region: text("region"),
  miles: real("miles").notNull(),
  durationHours: real("duration_hours").notNull(),
  moodTag: text("mood_tag").notNull(),
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull().default(3),
  bestSeason: text("best_season"),
  route: jsonb("route").$type<LatLng[]>().notNull(),
  stops: jsonb("stops").$type<NamedStop[]>(),
  outdatedAt: timestamp("outdated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

export const BIKE_TYPES = [
  "adventure",
  "cruiser",
  "scooter",
  "sport",
  "standard",
  "touring",
  "track",
] as const;;

export type BikeType = (typeof BIKE_TYPES)[number];

export const bikes = pgTable("bikes", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  nickname: text("nickname").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  type: text("type").$type<BikeType>().notNull(),
  mileage: integer("mileage").notNull().default(0),
  imageUrl: text("image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Bike = typeof bikes.$inferSelect;
export type NewBike = typeof bikes.$inferInsert;

export const SAVED_TRIP_STATUSES = ["wishlist", "upcoming"] as const;
export type SavedTripStatus = (typeof SAVED_TRIP_STATUSES)[number];

export const savedTrips = pgTable(
  "saved_trips",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    status: text("status").$type<SavedTripStatus>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("saved_trips_user_trip_unique").on(table.userId, table.tripId),
  ],
);

export type SavedTrip = typeof savedTrips.$inferSelect;

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    tripId: integer("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    reviewerName: text("reviewer_name").notNull(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [uniqueIndex("reviews_trip_user_unique").on(table.tripId, table.userId)],
);

export type Review = typeof reviews.$inferSelect;
