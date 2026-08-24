import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { trips, type NewTrip, type Trip } from "@/db/schema";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createTrip(
  input: Omit<NewTrip, "slug">,
): Promise<Trip> {
  const db = getDb();

  const base = slugify(input.name) || "ride";
  let slug = base;
  for (let attempt = 1; attempt < 20; attempt++) {
    const [existing] = await db
      .select({ id: trips.id })
      .from(trips)
      .where(eq(trips.slug, slug))
      .limit(1);
    if (!existing) break;
    slug = `${base}-${attempt + 1}`;
  }

  const [trip] = await db
    .insert(trips)
    .values({ ...input, slug })
    .returning();
  return trip;
}
