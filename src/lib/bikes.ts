import { and, desc, eq } from "drizzle-orm";
import { issueSignedToken, presignUrl } from "@vercel/blob";
import { getDb } from "@/db";
import { bikes, type Bike, type BikeType, type NewBike } from "@/db/schema";

export async function getBikes(userId: string): Promise<Bike[]> {
  const db = getDb();
  return db
    .select()
    .from(bikes)
    .where(eq(bikes.userId, userId))
    .orderBy(desc(bikes.createdAt));
}

export async function createBike(input: NewBike): Promise<Bike> {
  const db = getDb();
  const [bike] = await db.insert(bikes).values(input).returning();
  return bike;
}

export async function setMileage(
  id: number,
  userId: string,
  mileage: number,
): Promise<void> {
  const db = getDb();
  await db
    .update(bikes)
    .set({ mileage })
    .where(and(eq(bikes.id, id), eq(bikes.userId, userId)));
}

export function accentForBike(type: string): string {
  let hash = 0;
  for (let i = 0; i < type.length; i++) {
    hash = (hash * 31 + type.charCodeAt(i)) | 0;
  }
  const accents = ["#FFD02F", "#FF5D8F", "#2EC4B6", "#9D4EDD", "#FF8C42", "#06D6A0"];
  return accents[Math.abs(hash) % accents.length];
}

export function bikeTypeLabel(type: BikeType): string {
  const labels: Record<BikeType, string> = {
    sport: "Sport",
    cruiser: "Cruiser",
    touring: "Touring",
    adventure: "Adventure",
    standard: "Standard",
    scooter: "Scooter",
    track: "Track",
  };
  return labels[type];
}

const PHOTO_URL_TTL_MS = 60 * 60 * 1000;

export async function resolvePhotoUrls(rows: Bike[]): Promise<Bike[]> {
  if (!rows.some((bike) => bike.imageUrl)) {
    return rows;
  }

  try {
    const signedToken = await issueSignedToken({
      operations: ["get"],
      validUntil: Date.now() + PHOTO_URL_TTL_MS,
    });

    return await Promise.all(
      rows.map(async (bike) => {
        if (!bike.imageUrl) return bike;
        const { presignedUrl } = await presignUrl(signedToken, {
          operation: "get",
          pathname: bike.imageUrl,
          access: "private",
        });
        return { ...bike, imageUrl: presignedUrl };
      }),
    );
  } catch (err) {
    console.error(
      "Failed to presign photo URLs, falling back to raw URLs:",
      err,
    );
    return rows;
  }
}
