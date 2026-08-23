import { pgTable, real, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export type LatLng = [number, number];

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  miles: real("miles").notNull(),
  durationHours: real("duration_hours").notNull(),
  moodTag: text("mood_tag").notNull(),
  description: text("description").notNull(),
  route: jsonb("route").$type<LatLng[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Trip = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;
