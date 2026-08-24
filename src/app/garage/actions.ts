"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import type { BikeType } from "@/db/schema";
import { BIKE_TYPES } from "@/db/schema";
import { createBike, setMileage } from "@/lib/bikes";

export type AddBikeResult = { ok: true } | { ok: false; error: string };

export async function addBikeAction(input: {
  nickname: string;
  make: string;
  model: string;
  year: number;
  type: BikeType;
  mileage: number;
  notes?: string;
  imageUrl?: string | null;
}): Promise<AddBikeResult> {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "You need to sign in first." };
  }

  const nickname = input.nickname.trim();
  const make = input.make.trim();
  const model = input.model.trim();

  if (!nickname || !make || !model) {
    return { ok: false, error: "Nickname, make, and model are required." };
  }
  if (!BIKE_TYPES.includes(input.type)) {
    return { ok: false, error: "Pick a valid bike type." };
  }
  const currentYear = new Date().getFullYear() + 1;
  if (!Number.isInteger(input.year) || input.year < 1930 || input.year > currentYear) {
    return { ok: false, error: `Year must be between 1930 and ${currentYear}.` };
  }
  if (!Number.isFinite(input.mileage) || input.mileage < 0 || input.mileage > 2_000_000) {
    return { ok: false, error: "Mileage looks off." };
  }

  await createBike({
    userId,
    nickname,
    make,
    model,
    year: input.year,
    type: input.type,
    mileage: Math.round(input.mileage),
    notes: input.notes?.trim() || null,
    imageUrl: input.imageUrl ?? null,
  });

  revalidatePath("/garage");
  return { ok: true };
}

export async function updateMileageAction(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) return;

  const id = Number(formData.get("id"));
  const mileage = Number(formData.get("mileage"));

  if (!Number.isInteger(id) || id <= 0) return;
  if (!Number.isFinite(mileage) || mileage < 0 || mileage > 2_000_000) return;

  await setMileage(id, userId, mileage);
  revalidatePath("/garage");
}
