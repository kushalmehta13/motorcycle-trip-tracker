import Link from "next/link";
import { categoryLabel } from "@/components/CategoryFilter";
import { accentForTag, type TripWithRating } from "@/lib/trips";
import RatingBlocks from "./RatingBlocks";
import RouteMap from "./RouteMap";

function formatDuration(hours: number): string {
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  if (whole === 0) return `${mins} MIN`;
  if (mins === 0) return `${whole} HR${whole > 1 ? "S" : ""}`;
  return `${whole}H ${mins}M`;
}

export default function TripCard({ trip }: { trip: TripWithRating }) {
  const accent = accentForTag(trip.moodTag);

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="brutal-card flex flex-col bg-white transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--color-ink)]"
    >
      <div className="relative h-44 shrink-0 overflow-hidden border-b-[3px] border-ink bg-paper">
        <RouteMap points={trip.route} color={accent} />
        {trip.reviewCount > 0 && (
          <span className="brutal-chip absolute left-2 top-2 z-10 flex items-center gap-1.5 bg-white px-1.5 py-1">
            <RatingBlocks value={trip.avgRating ?? 0} size="sm" />
            <span className="text-[10px] font-bold">{Number(trip.avgRating ?? 0).toFixed(1)}</span>
          </span>
        )}
      </div>

      <div className="flex grow flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="brutal-chip -rotate-1 px-2 py-1 text-[11px] font-bold tracking-widest uppercase"
            style={{ backgroundColor: accent }}
          >
            {trip.moodTag}
          </span>
          <span className="rotate-1 border-2 border-ink bg-paper px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase opacity-80">
            {categoryLabel(trip.category)}
          </span>
        </div>

        <h2 className="font-display text-xl leading-tight uppercase">
          {trip.name}
        </h2>

        <p className="text-sm leading-relaxed font-medium">
          {trip.description}
        </p>
      </div>

      <div className="grid grid-cols-2 border-t-[3px] border-ink text-center font-display text-sm">
        <div className="border-r-[3px] border-ink py-2.5">
          {Math.round(trip.miles)} MI
        </div>
        <div className="py-2.5">{formatDuration(trip.durationHours)}</div>
      </div>
    </Link>
  );
}
