"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { slugToLabel as labelize } from "@/lib/labels";
import BrutalSelect from "./BrutalSelect";
import type { GeoBucket, TripSort } from "@/lib/trips";

const ALL = "__all__";

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
      <BrutalSelect
        ariaLabel="Filter by continent"
        options={[
          { value: ALL, label: "All continents" },
          ...continents.map(({ value, count }) => ({
            value,
            label: `${labelize(value)} (${count})`,
          })),
        ]}
        value={searchParams.get("continent") ?? ALL}
        onValueChange={(value) => update("continent", value === ALL ? undefined : value)}
      />

      <BrutalSelect
        ariaLabel="Filter by country"
        options={[
          { value: ALL, label: "All countries" },
          ...countries.map(({ value, count }) => ({
            value,
            label: `${labelize(value)} (${count})`,
          })),
        ]}
        value={searchParams.get("country") ?? ALL}
        onValueChange={(value) => update("country", value === ALL ? undefined : value)}
      />

      <BrutalSelect
        ariaLabel="Filter by state or province"
        options={[
          { value: ALL, label: "All states / provinces" },
          ...states.map(({ value, count }) => ({
            value,
            label: `${labelize(value)} (${count})`,
          })),
        ]}
        value={searchParams.get("state") ?? ALL}
        onValueChange={(value) => update("state", value === ALL ? undefined : value)}
      />

      <BrutalSelect
        ariaLabel="Filter by part of state"
        options={[
          { value: ALL, label: "All areas" },
          ...regions.map(({ value, count }) => ({
            value,
            label: `${labelize(value)} (${count})`,
          })),
        ]}
        value={searchParams.get("region") ?? ALL}
        onValueChange={(value) => update("region", value === ALL ? undefined : value)}
      />

      <BrutalSelect
        ariaLabel="Sort rides"
        options={[
          { value: "popular", label: "Most popular" },
          { value: "rating", label: "Highest rated" },
          { value: "newest", label: "Newest" },
          { value: "miles", label: "Shortest" },
        ]}
        value={sort}
        onValueChange={(value) => update("sort", value)}
      />

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
