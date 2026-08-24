"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { TRIP_CATEGORIES, type TripCategory } from "@/db/schema";
import { createTripAction } from "@/app/trips/actions";
import RoutePlotter from "./RoutePlotter";

const inputClass =
  "w-full border-[3px] border-ink bg-white px-3 py-2.5 text-sm font-medium placeholder:text-ink/40 focus:outline-none focus-visible:outline-none focus:border-accent-pink";
const labelClass =
  "block text-[11px] font-bold tracking-[0.18em] uppercase mb-1.5";

export default function NewTripForm() {
  const router = useRouter();
  const [points, setPoints] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const miles = Number(form.get("miles"));
    const durationHours = Number(form.get("durationHours"));
    const difficulty = Number(form.get("difficulty"));

    if (!String(form.get("name")).trim()) {
      setError("Give the ride a name.");
      return;
    }
    if (!Number.isFinite(miles) || miles <= 0) {
      setError("Enter the mileage (check the estimate above).");
      return;
    }
    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      setError("Enter an estimated ride time in hours.");
      return;
    }

    setBusy(true);
    const result = await createTripAction({
      name: String(form.get("name")),
      category: String(form.get("category")) as TripCategory,
      moodTag: String(form.get("moodTag") ?? ""),
      description: String(form.get("description") ?? ""),
      bestSeason: String(form.get("bestSeason") ?? ""),
      miles,
      durationHours,
      difficulty,
      route: points,
    });

    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }

    router.push(`/trips/${result.data.slug}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section>
        <span className={labelClass}>Route *</span>
        <RoutePlotter points={points} onPointsChange={setPoints} />
        <p className="mt-2 text-[11px] font-medium opacity-60">
          Click to trace the road start → finish. Every click adds a waypoint.
        </p>
      </section>

      <section className="brutal-card grid gap-5 bg-white p-5 sm:grid-cols-2 sm:p-7">
        <div className="sm:col-span-2">
          <label htmlFor="name" className={labelClass}>
            Ride name *
          </label>
          <input id="name" name="name" className={inputClass} placeholder="Cherohala Skyway Run" maxLength={60} />
        </div>

        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select id="category" name="category" className={inputClass} defaultValue="mixed">
            {TRIP_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="moodTag" className={labelClass}>
            Mood tag *
          </label>
          <input id="moodTag" name="moodTag" className={inputClass} placeholder="Twisty & Technical" maxLength={30} />
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
          />
        </div>

        <div>
          <label htmlFor="miles" className={labelClass}>
            Miles *
          </label>
          <input id="miles" name="miles" type="number" min={1} max={5000} step="0.1" className={inputClass} placeholder="52" />
        </div>

        <div>
          <label htmlFor="durationHours" className={labelClass}>
            Ride time (hours) *
          </label>
          <input id="durationHours" name="durationHours" type="number" min={0.1} max={100} step="0.1" className={inputClass} placeholder="1.8" />
        </div>

        <div>
          <label htmlFor="difficulty" className={labelClass}>
            Difficulty
          </label>
          <select id="difficulty" name="difficulty" className={inputClass} defaultValue="3">
            {[1, 2, 3, 4, 5].map((level) => (
              <option key={level} value={level}>
                {level} —{" "}
                {["Sunday cruise", "Relaxed", "Moderate", "Demanding", "Expert only"][level - 1]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bestSeason" className={labelClass}>
            Best season
          </label>
          <input id="bestSeason" name="bestSeason" className={inputClass} placeholder="Apr – Oct" maxLength={30} />
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
        {busy ? "Publishing…" : "Share it with the community"}
      </button>
    </form>
  );
}
