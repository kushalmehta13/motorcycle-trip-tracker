import { asc } from "drizzle-orm";
import { getDb } from "@/db";
import { trips, type Trip } from "@/db/schema";

const ACCENTS = [
  "#FFD02F", // yellow
  "#FF5D8F", // pink
  "#2EC4B6", // teal
  "#9D4EDD", // purple
  "#FF8C42", // orange
  "#06D6A0", // green
] as const;

export function accentForTag(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
}

export async function getTrips(): Promise<Trip[]> {
  const db = getDb();
  return db.select().from(trips).orderBy(asc(trips.id));
}
