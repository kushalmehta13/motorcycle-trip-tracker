import Link from "next/link";
import type { Review, SavedTripStatus } from "@/db/schema";
import type { TripWithRating } from "@/lib/trips";
import { accentForTag } from "@/lib/trips";
import GpxDownloadButton from "./GpxDownloadButton";
import RatingBlocks from "./RatingBlocks";
import ReviewForm from "./ReviewForm";
import RouteMap from "./RouteMap";
import SavedTripButtons from "./SavedTripButtons";

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

export default function TripDetail({
  trip,
  reviews = [],
  userReview = null,
  savedStatuses,
  isSignedIn = false,
}: {
  trip: TripWithRating;
  reviews?: Review[];
  userReview?: Review | null;
  savedStatuses?: SavedTripStatus[];
  isSignedIn?: boolean;
}) {
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
        {trip.outdatedAt && (
          <span className="brutal-chip ml-3 inline-block rotate-1 bg-accent-orange px-2 py-1 align-middle text-[10px] tracking-widest">
            Outdated report
          </span>
        )}
      </h2>

      {trip.stops && trip.stops.length > 0 && (
        <p className="px-5 pt-3 text-xs font-bold tracking-wide uppercase opacity-70 sm:px-7">
          {trip.stops.map((stop) => stop.name).join(" → ")}
        </p>
      )}

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
          <StatCell
            label="Community rating"
            value={
              trip.reviewCount > 0
                ? `${Number(trip.avgRating ?? 0).toFixed(1)} / 5`
                : "Unrated"
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-5 sm:px-7">
        <div className="flex flex-wrap items-center gap-4">
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
        </div>

        {isSignedIn && savedStatuses && (
          <SavedTripButtons tripId={trip.id} initial={savedStatuses} />
        )}
      </div>

      <section aria-label="Ride reports" className="mt-7 border-y-[3px] border-ink bg-white px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-sm tracking-wide uppercase">
            Ride reports
          </h3>
          {trip.reviewCount > 0 && (
            <span className="flex items-center gap-2">
              <RatingBlocks value={trip.avgRating ?? 0} size="sm" />
              <span className="text-xs font-bold opacity-70">
                {Number(trip.avgRating ?? 0).toFixed(1)} · {trip.reviewCount}{" "}
                {trip.reviewCount === 1 ? "report" : "reports"}
              </span>
            </span>
          )}
        </div>

        {reviews.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-4">
            {reviews.map((review) => (
              <li key={review.id} className="border-l-4 border-accent-teal pl-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold tracking-widest uppercase">
                    {review.reviewerName}
                  </span>
                  <RatingBlocks value={review.rating} size="sm" accent="#FFD02F" />
                  <span className="text-[10px] font-medium opacity-50">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm leading-relaxed font-medium opacity-80">
                    {review.comment}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm font-medium opacity-60">
            No ride reports yet — be the first to weigh in.
          </p>
        )}

        <div className="mt-5">
          {isSignedIn ? (
            <ReviewForm
              tripId={trip.id}
              initialRating={userReview?.rating}
              initialComment={userReview?.comment ?? null}
            />
          ) : (
            <p className="text-sm font-medium opacity-70">
              <Link
                href={`/sign-in?redirect_url=/trips/${trip.slug}`}
                className="underline decoration-2 underline-offset-2 hover:text-accent-pink"
              >
                Sign in
              </Link>{" "}
              to rate this ride or add it to your list.
            </p>
          )}
        </div>
      </section>

      <div className="px-5 py-6 sm:px-7">
        <GpxDownloadButton name={trip.name} slug={trip.slug} points={trip.route} />
        <p className="mt-2 text-center text-[11px] font-medium opacity-60">
          Drop it into Garmin, Calimoto, or REVER and ride.
        </p>
      </div>
    </article>
  );
}
