import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bikes, type Bike, type BikeType, type NewBike } from "@/db/schema";

export async function getBikes(): Promise<Bike[]> {
  const db = getDb();
  return db.select().from(bikes).orderBy(desc(bikes.createdAt));
}

export async function createBike(input: NewBike): Promise<Bike> {
  const db = getDb();
  const [bike] = await db.insert(bikes).values(input).returning();
  return bike;
}

export async function setMileage(id: number, mileage: number): Promise<void> {
  const db = getDb();
  await db.update(bikes).set({ mileage }).where(eq(bikes.id, id));
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
