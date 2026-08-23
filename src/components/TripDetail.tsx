import type { Trip } from "@/db/schema";
import { accentForTag } from "@/lib/trips";
import GpxDownloadButton from "./GpxDownloadButton";
import RouteMap from "./RouteMap";

function formatDuration(hours: number): string {
  const whole = Math.floor(hours);
  const mins = Math.round((hours - whole) * 60);
  if (whole === 0) return `${mins} min`;
  if (mins === 0) return `${whole} hr${whole > 1 ? "s" : ""}`;
  return `${whole}h ${mins}m`;
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <div className="font-display text-base leading-tight uppercase">{value}</div>
      <div className="mt-1 text-[10px] font-bold tracking-[0.18em] uppercase opacity-60">
        {label}
      </div>
    </div>
  );
}

export default function TripDetail({ trip }: { trip: Trip }) {
  const accent = accentForTag(trip.moodTag);

  return (
    <article>
      <div className="flex flex-wrap items-center gap-2 px-5 pt-5 sm:px-7">
        <span
          className="brutal-chip -rotate-1 px-2 py-1 text-[11px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: accent }}
        >
          {trip.moodTag}
        </span>
        {trip.bestSeason && (
          <span className="brutal-chip rotate-1 bg-white px-2 py-1 text-[11px] font-bold tracking-widest uppercase">
            Best · {trip.bestSeason}
          </span>
        )}
      </div>

      <h2 className="font-display px-5 pt-4 text-2xl leading-tight uppercase sm:px-7 sm:text-3xl">
        {trip.name}
      </h2>

      <div className="mt-4 h-64 border-y-[3px] border-ink sm:h-80">
        <RouteMap points={trip.route} color={accent} interactive />
      </div>

      <p className="px-5 pt-5 text-sm leading-relaxed font-medium sm:px-7 sm:text-base">
        {trip.description}
      </p>

      <div className="mt-5 grid grid-cols-2 border-y-[3px] border-ink sm:grid-cols-3">
        <div className="border-r-[3px] border-b-[3px] border-ink sm:border-b-0">
          <StatCell label="Distance" value={`${Math.round(trip.miles)} mi`} />
        </div>
        <div className="border-b-[3px] border-ink sm:border-r-[3px] sm:border-b-0">
          <StatCell label="Ride time" value={formatDuration(trip.durationHours)} />
        </div>
        <div className="col-span-2 border-t-[3px] border-ink sm:col-span-1 sm:border-t-0">
          <StatCell label="Waypoints logged" value={String(trip.route.length)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-5 pt-5 sm:px-7">
        <div className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-60">
          Difficulty
        </div>
        <div className="flex gap-1.5" aria-label={`Difficulty ${trip.difficulty} of 5`}>
          {[1, 2, 3, 4, 5].map((level) => (
            <span
              key={level}
              className="inline-block h-4 w-6 border-2 border-ink"
              style={{
                backgroundColor:
                  level <= trip.difficulty ? accent : "var(--color-paper)",
              }}
            />
          ))}
        </div>
        <div className="text-xs font-bold tracking-widest uppercase">
          {trip.difficulty}/5
        </div>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <GpxDownloadButton name={trip.name} slug={trip.slug} points={trip.route} />
        <p className="mt-2 text-center text-[11px] font-medium opacity-60">
          Drop it into Garmin, Calimoto, or REVER and ride.
        </p>
      </div>
    </article>
  );
}
