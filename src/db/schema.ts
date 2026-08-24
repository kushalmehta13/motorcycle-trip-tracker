import {
  pgTable,
  real,
  serial,
  text,
  timestamp,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

export type LatLng = [number, number];

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  miles: real("miles").notNull(),
  durationHours: real("duration_hours").notNull(),
  moodTag: text("mood_tag").notNull(),
  description: text("description").notNull(),
  difficulty: integer("difficulty").notNull().default(3),
  bestSeason: text("best_season"),
  route: jsonb("route").$type<LatLng[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

export const BIKE_TYPES = [
  "sport",
  "cruiser",
  "touring",
  "adventure",
  "standard",
  "scooter",
  "track",
] as const;

export type BikeType = (typeof BIKE_TYPES)[number];

export const bikes = pgTable("bikes", {
  id: serial("id").primaryKey(),
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
