"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { NamedStop } from "@/db/schema";

const RoutePreviewMap = dynamic(() => import("./RoutePreviewMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper">
      <span className="font-display text-[11px] tracking-[0.2em] uppercase opacity-60">
        Loading map…
      </span>
    </div>
  ),
});

type SearchResult = {
  label: string;
  name: string;
  lat: number;
  lng: number;
};

function buildLabel(properties: Record<string, string>): { name: string; label: string } {
  const name = properties.name || properties.street || properties.city || "Unnamed place";
  const parts = [
    properties.name,
    properties.city || properties.county,
    properties.state,
    properties.country,
  ].filter((part, index, all) => part && part !== name && all.indexOf(part) === index);
  return { name, label: [name, ...parts].join(", ") };
}

export default function StopRouteEditor({
  stops,
  onChange,
}: {
  stops: NamedStop[];
  onChange: (stops: NamedStop[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [estimate, setEstimate] = useState<{ miles: number; hours: number } | null>(null);
  const [routing, setRouting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  async function runSearch() {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`,
      );
      const data = (await response.json()) as {
        features?: { properties: Record<string, string>; geometry: { coordinates: [number, number] } }[];
      };
      setResults(
        (data.features ?? []).map((feature) => ({
          ...buildLabel(feature.properties ?? {}),
          lat: feature.geometry.coordinates[1],
          lng: feature.geometry.coordinates[0],
        })),
      );
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function addStop(result: SearchResult) {
    onChange([
      ...stops,
      { name: result.name.slice(0, 80), lat: result.lat, lng: result.lng },
    ]);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function removeStop(index: number) {
    onChange(stops.filter((_, i) => i !== index));
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchRoute() {
      abortRef.current?.abort();
      if (stops.length < 2) {
        setRoute([]);
        setEstimate(null);
        return;
      }
      setRouting(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const coords = stops
          .map((stop) => `${stop.lng.toFixed(6)},${stop.lat.toFixed(6)}`)
          .join(";");
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as {
          routes?: {
            distance: number;
            duration: number;
            geometry: { coordinates: [number, number][] };
          }[];
        };
        const first = data.routes?.[0];
        const coordinates = first?.geometry?.coordinates;
        if (!cancelled && first && coordinates && coordinates.length >= 2) {
          setRoute(
            coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
          );
          setEstimate({
            miles: Math.round(first.distance / 1609.34),
            hours: Math.round((first.duration / 3600) * 10) / 10,
          });
        }
      } catch {
        if (!cancelled) {
          setRoute(stops.map((stop) => [stop.lat, stop.lng]));
          setEstimate(null);
        }
      } finally {
        if (!cancelled) setRouting(false);
      }
    }

    void fetchRoute();
    return () => {
      cancelled = true;
    };
  }, [stops]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            void runSearch();
          }}
          onFocus={() => results.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search a town, pass, or landmark…"
          aria-label="Search locations"
          className="w-full border-[3px] border-ink bg-white px-3 py-2.5 text-sm font-medium placeholder:text-ink/40 focus:border-accent-pink focus:outline-none focus-visible:outline-none"
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tracking-widest uppercase opacity-50">
            …
          </span>
        )}
        {open && results.length > 0 && (
          <ul className="absolute z-1000 mt-1 w-full border-[3px] border-ink bg-white shadow-[4px_4px_0_0_var(--color-ink)]">
            {results.map((result) => (
              <li key={`${result.label}-${result.lat}`}>
                <button
                  type="button"
                  onClick={() => addStop(result)}
                  className="w-full cursor-pointer px-3 py-2 text-left text-sm font-medium hover:bg-paper"
                >
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {stops.length > 0 && (
        <ol className="flex flex-col gap-1.5">
          {stops.map((stop, index) => (
            <li
              key={`${stop.name}-${index}`}
              className="flex items-center gap-2 border-[3px] border-ink bg-paper px-2.5 py-1.5 text-sm font-bold"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center border-2 border-ink bg-accent-yellow text-[10px]">
                {index + 1}
              </span>
              <span className="grow truncate">{stop.name}</span>
              <button
                type="button"
                onClick={() => removeStop(index)}
                aria-label={`Remove ${stop.name}`}
                className="cursor-pointer border-2 border-ink bg-white px-1.5 text-xs leading-tight hover:bg-accent-pink hover:text-paper"
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="h-72 border-[3px] border-ink sm:h-96">
        <RoutePreviewMap route={route} stops={stops} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold tracking-widest uppercase opacity-60">
          {stops.length < 2
            ? "Add at least two stops to draw the route"
            : routing
              ? "Finding roads…"
              : `${route.length} road points`}
        </span>
        {estimate && (
          <>
            <span className="border-2 border-ink bg-paper px-2 py-0.5 text-[11px] font-bold">
              ≈ {estimate.miles} mi · {estimate.hours} h riding
            </span>
            <span className="text-[10px] font-medium opacity-50">
              auto-filled below — tweak if you know better
            </span>
          </>
        )}
        {stops.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="brutal-chip ml-auto cursor-pointer bg-white px-3 py-1 text-[11px] font-bold uppercase transition-transform duration-150 hover:-translate-y-0.5"
          >
            Clear all
          </button>
        )}
      </div>

      <input type="hidden" data-stops-count={stops.length} />
    </div>
  );
}
