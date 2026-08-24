import type { TripCategory } from "@/db/schema";

const ACRONYMS = new Set(["usa", "uk", "uae", "nc", "tn"]);

export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) =>
      ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

const CATEGORY_LABELS: Record<TripCategory, string> = {
  mountain: "Mountain",
  coastal: "Coastal",
  desert: "Desert",
  forest: "Forest",
  canyon: "Canyon",
  mixed: "Mixed",
};

export function categoryLabel(category: TripCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}
