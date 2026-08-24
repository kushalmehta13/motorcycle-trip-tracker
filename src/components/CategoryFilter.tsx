import Link from "next/link";
import { TRIP_CATEGORIES, type TripCategory } from "@/db/schema";

const LABELS: Record<TripCategory, string> = {
  mountain: "Mountain",
  coastal: "Coastal",
  desert: "Desert",
  forest: "Forest",
  canyon: "Canyon",
  mixed: "Mixed",
};

export function categoryLabel(category: TripCategory): string {
  return LABELS[category] ?? category;
}

export default function CategoryFilter({
  active,
  q,
}: {
  active?: string;
  q?: string;
}) {
  function href(category?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `/?${query}` : "/";
  }

  const chipBase = "brutal-chip px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase whitespace-nowrap transition-transform duration-150 hover:-translate-y-0.5";

  return (
    <div className="flex flex-col gap-4">
      <form method="GET" action="/" className="flex max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search rides…"
          aria-label="Search rides"
          className="grow border-[3px] border-r-0 border-ink bg-white px-3 py-2 text-sm font-medium placeholder:text-ink/40 focus:outline-none"
        />
        {active && <input type="hidden" name="category" value={active} />}
        <button
          type="submit"
          className="border-[3px] border-ink bg-accent-yellow px-4 text-xs font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5"
        >
          Search
        </button>
      </form>

      <nav aria-label="Trip categories" className="flex flex-wrap items-center gap-2">
        <Link href={href()} className={`${chipBase} ${!active ? "bg-accent-pink text-paper" : "bg-white"}`}>
          All roads
        </Link>
        {TRIP_CATEGORIES.map((category) => (
          <Link
            key={category}
            href={href(category)}
            className={`${chipBase} ${active === category ? "bg-accent-pink text-paper" : "bg-white"}`}
          >
            {LABELS[category]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
