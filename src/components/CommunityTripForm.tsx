"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CONTINENTS,
  TRIP_CATEGORIES,
  type LatLng,
  type NamedStop,
  type TripCategory,
} from "@/db/schema";
import { createTripAction, updateTripAction } from "@/app/trips/actions";
import StopRouteEditor from "./StopRouteEditor";
import BrutalSelect from "./BrutalSelect";

const inputClass =
  "w-full border-[3px] border-ink bg-white px-3 py-2.5 text-sm font-medium placeholder:text-ink/40 focus:outline-none focus-visible:outline-none focus:border-accent-pink";
const labelClass =
  "block text-[11px] font-bold tracking-[0.18em] uppercase mb-1.5";

function displayCase(slug: string | null | undefined): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function CommunityTripForm({
  mode,
  tripId,
  initial,
}: {
  mode: "create" | "edit";
  tripId?: number;
  initial?: {
    name: string;
    category: TripCategory;
    continent: string | null;
    country: string | null;
    stateProvince: string | null;
    moodTag: string;
    description: string;
    region: string | null;
    miles: number;
    durationHours: number;
    difficulty: number;
    bestSeason: string | null;
    stops: NamedStop[];
    route: LatLng[];
  };
}) {
  const router = useRouter();
  const [stops, setStops] = useState<NamedStop[]>(initial?.stops ?? []);
  const [routeOverride, setRouteOverride] = useState<LatLng[] | null>(
    initial?.route ?? null,
  );
  const [continent, setContinent] = useState(initial?.continent ?? "");
  const [country, setCountry] = useState(displayCase(initial?.country));
  const [stateProvince, setStateProvince] = useState(displayCase(initial?.stateProvince));
  const [region, setRegion] = useState(displayCase(initial?.region));
  const [category, setCategory] = useState<TripCategory>(
    initial?.category ?? "mixed",
  );
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? 3);
  const [miles, setMiles] = useState(initial ? String(initial.miles) : "");
  const [duration, setDuration] = useState(
    initial ? String(initial.durationHours) : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const parsedMiles = Number(miles);
    const parsedDuration = Number(duration);

    if (stops.length < 2) {
      setError("Add at least two stops to build a route.");
      return;
    }
    if (!Number.isFinite(parsedMiles) || parsedMiles <= 0) {
      setError("Enter the mileage.");
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setError("Enter an estimated ride time in hours.");
      return;
    }

    setBusy(true);
    const payload = {
      name: String(form.get("name") ?? ""),
      category,
      continent,
      country,
      stateProvince,
      moodTag: String(form.get("moodTag") ?? ""),
      description: String(form.get("description") ?? ""),
      region,
      bestSeason: String(form.get("bestSeason") ?? ""),
      miles: parsedMiles,
      durationHours: parsedDuration,
      difficulty,
      stops,
      route: routeOverride ?? undefined,
    };

    const result =
      mode === "edit" && tripId
        ? await updateTripAction(tripId, payload)
        : await createTripAction(payload);

    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    setBusy(false);
    window.history.replaceState(window.history.state, "", "/garage#your-rides");
    router.push(`/trips/${result.data.slug}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section>
        <span className={labelClass}>Stops & route *</span>
        <StopRouteEditor
          stops={stops}
          onChange={(nextStops) => {
            setRouteOverride(null);
            setStops(nextStops);
          }}
          onGeoHint={(hint) => {
            if (hint.continent) setContinent(hint.continent);
            if (hint.country) setCountry(displayCase(hint.country));
            if (hint.stateProvince) setStateProvince(displayCase(hint.stateProvince));
            if (hint.region) setRegion(displayCase(hint.region));
          }}
          overrideRoute={routeOverride}
          onGpxImported={(importedStops, route, estimate) => {
            setRouteOverride(route);
            setStops(importedStops);
            setMiles(String(estimate.miles));
            setDuration(String(estimate.hours));
          }}
          onEstimate={(estimate) => {
            if (estimate) {
              setMiles(String(estimate.miles));
              setDuration(String(estimate.hours));
            }
          }}
        />
      </section>

      <section className="brutal-card grid gap-5 bg-white p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            Ride name *
          </label>
          <input
            id="name"
            name="name"
            className={inputClass}
            placeholder="Cherohala Skyway Run"
            maxLength={60}
            defaultValue={initial?.name ?? ""}
          />
        </div>

        <div>
          <label htmlFor="continent" className={labelClass}>
            Continent *
          </label>
          <BrutalSelect
            id="continent"
            name="continent"
            size="field"
            ariaLabel="Continent"
            options={CONTINENTS.map((c) => ({
              value: c,
              label: c
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" "),
            }))}
            value={continent || CONTINENTS[0]}
            onValueChange={setContinent}
          />
        </div>

        <div>
          <label htmlFor="country" className={labelClass}>
            Country *
          </label>
          <input
            id="country"
            name="country"
            className={inputClass}
            placeholder="USA"
            maxLength={40}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="stateProvince" className={labelClass}>
            State / province
          </label>
          <input
            id="stateProvince"
            name="stateProvince"
            className={inputClass}
            placeholder="Auto-detected from your stops"
            maxLength={40}
            value={stateProvince}
            onChange={(event) => setStateProvince(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="region" className={labelClass}>
            Part of state
          </label>
          <input
            id="region"
            name="region"
            className={inputClass}
            placeholder="County or area"
            maxLength={40}
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <BrutalSelect
            name="category"
            size="field"
            ariaLabel="Category"
            options={TRIP_CATEGORIES.map((c) => ({
              value: c,
              label: c.charAt(0).toUpperCase() + c.slice(1),
            }))}
            value={category}
            onValueChange={(value) => setCategory(value as TripCategory)}
          />
        </div>

        <div>
          <label htmlFor="moodTag" className={labelClass}>
            Mood tag *
          </label>
          <input
            id="moodTag"
            name="moodTag"
            className={inputClass}
            placeholder="Twisty & Technical"
            maxLength={30}
            defaultValue={initial?.moodTag ?? ""}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className={labelClass}>
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={400}
            className={inputClass}
            placeholder="What should riders expect? Road surface, traffic, fuel stops, hazards…"
            defaultValue={initial?.description ?? ""}
          />
        </div>

        <div>
          <label htmlFor="miles" className={labelClass}>
            Miles *
          </label>
          <input
            id="miles"
            name="miles"
            type="number"
            min={1}
            max={5000}
            step="0.1"
            className={inputClass}
            value={miles}
            onChange={(event) => setMiles(event.target.value)}
            placeholder="52"
          />
        </div>

        <div>
          <label htmlFor="durationHours" className={labelClass}>
            Ride time (hours) *
          </label>
          <input
            id="durationHours"
            name="durationHours"
            type="number"
            min={0.1}
            max={100}
            step="0.1"
            className={inputClass}
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="1.8"
          />
        </div>

        <div>
          <label htmlFor="difficulty" className={labelClass}>
            Difficulty
          </label>
          <BrutalSelect
            id="difficulty"
            name="difficulty"
            size="field"
            ariaLabel="Difficulty"
            options={[1, 2, 3, 4, 5].map((level) => ({
              value: String(level),
              label: `${level} — ${["Sunday cruise", "Relaxed", "Moderate", "Demanding", "Expert only"][level - 1]}`,
            }))}
            value={String(difficulty)}
            onValueChange={(value) => setDifficulty(Number(value))}
          />
        </div>

        <div>
          <label htmlFor="bestSeason" className={labelClass}>
            Best season
          </label>
          <input
            id="bestSeason"
            name="bestSeason"
            className={inputClass}
            placeholder="Apr – Oct"
            maxLength={30}
            defaultValue={initial?.bestSeason ?? ""}
          />
        </div>
      </section>

      {error && (
        <p className="border-[3px] border-ink bg-accent-orange px-4 py-3 text-sm font-bold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="brutal-chip w-full cursor-pointer bg-accent-yellow px-4 py-3.5 font-display text-sm tracking-widest uppercase transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
      >
        {busy
          ? "Saving…"
          : mode === "edit"
            ? "Save changes"
            : "Share it with the community"}
      </button>
    </form>
  );
}
