"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { slugToLabel as labelize } from "@/lib/labels";
import type { GeoBucket, TripSort } from "@/lib/trips";

const selectClass =
  "border-[3px] border-ink bg-white px-2.5 py-2 text-xs font-bold uppercase tracking-wide focus:border-accent-pink focus:outline-none focus-visible:outline-none";

export default function CatalogControls({
  continents,
  countries,
  states,
  regions,
  sort,
}: {
  continents: GeoBucket[];
  countries: GeoBucket[];
  states: GeoBucket[];
  regions: GeoBucket[];
  sort: TripSort;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value?: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) params.delete(key);
      else params.set(key, value);
      if (key !== "sort") params.delete("region");
      if (key !== "sort" && key !== "state") params.delete("state");
      if (
        key === "continent" ||
        key === "q" ||
        key === "category"
      )
        params.delete("country");
      const query = params.toString();
      router.push(query ? `/?${query}` : "/");
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <select
        aria-label="Filter by continent"
        className={selectClass}
        value={searchParams.get("continent") ?? ""}
        onChange={(event) => update("continent", event.target.value || undefined)}
      >
        <option value="">All continents</option>
        {continents.map(({ value, count }) => (
          <option key={value} value={value}>
            {labelize(value)} ({count})
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by country"
        className={selectClass}
        value={searchParams.get("country") ?? ""}
        onChange={(event) => update("country", event.target.value || undefined)}
      >
        <option value="">All countries</option>
        {countries.map(({ value, count }) => (
          <option key={value} value={value}>
            {labelize(value)} ({count})
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by state or province"
        className={selectClass}
        value={searchParams.get("state") ?? ""}
        onChange={(event) => update("state", event.target.value || undefined)}
      >
        <option value="">All states / provinces</option>
        {states.map(({ value, count }) => (
          <option key={value} value={value}>
            {labelize(value)} ({count})
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by part of state"
        className={selectClass}
        value={searchParams.get("region") ?? ""}
        onChange={(event) => update("region", event.target.value || undefined)}
      >
        <option value="">All areas</option>
        {regions.map(({ value, count }) => (
          <option key={value} value={value}>
            {labelize(value)} ({count})
          </option>
        ))}
      </select>

      <select
        aria-label="Sort rides"
        className={selectClass}
        value={sort}
        onChange={(event) => update("sort", event.target.value)}
      >
        <option value="popular">Most popular</option>
        <option value="rating">Highest rated</option>
        <option value="newest">Newest</option>
        <option value="miles">Shortest</option>
      </select>

      <form
        method="GET"
        action="/"
        onSubmit={(event) => {
          event.preventDefault();
          const input = new FormData(event.currentTarget).get("q");
          update("q", String(input ?? "") || undefined);
        }}
        className="flex"
      >
        <input
          key={searchParams.get("q") ?? "q"}
          type="search"
          name="q"
          defaultValue={searchParams.get("q") ?? ""}
          placeholder="Search…"
          aria-label="Search rides"
          className="w-40 border-[3px] border-r-0 border-ink bg-white px-3 py-1.5 text-sm font-medium placeholder:text-ink/40 focus:outline-none sm:w-52"
        />
        <button
          type="submit"
          className="cursor-pointer border-[3px] border-ink bg-accent-yellow px-3 text-xs font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5"
        >
          Go
        </button>
      </form>

      {(searchParams.get("continent") ||
        searchParams.get("country") ||
        searchParams.get("state") ||
        searchParams.get("category") ||
        searchParams.get("q")) && (
        <button
          type="button"
          onClick={() => router.push("/")}
          className="brutal-chip cursor-pointer bg-white px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5"
        >
          Reset filters
        </button>
      )}
    </div>
  );
}
