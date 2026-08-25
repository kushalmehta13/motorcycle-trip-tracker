"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { LatLng, NamedStop } from "@/db/schema";
import {
  downsamplePoints,
  nameStopsFromRoute,
  parseGpx,
  routeMiles,
} from "@/lib/gpx";
import {
  COUNTRY_TO_CONTINENT,
  deriveGeoFromStops,
  type DerivedGeo,
} from "@/lib/routing";

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
  geo: DerivedGeo;
};

export type RouteEstimate = { miles: number; hours: number };

function buildResult(properties: Record<string, string>): {
  name: string;
  label: string;
  geo: DerivedGeo;
} {
  const name =
    properties.name || properties.street || properties.city || "Unnamed place";
  const parts = [
    properties.name,
    properties.city || properties.county,
    properties.state,
    properties.country,
  ].filter((part, index, all) => part && part !== name && all.indexOf(part) === index);

  const geo: DerivedGeo = {};
  if (properties.state) geo.stateProvince = properties.state.toLowerCase();
  if (properties.county) geo.region = properties.county.toLowerCase();
  else if (properties.city) geo.region = properties.city.toLowerCase();
  if (properties.country) geo.country = properties.country.toLowerCase();
  const continentKey = (properties.countrycode ?? "").toLowerCase();
  if (COUNTRY_TO_CONTINENT[continentKey]) {
    geo.continent = COUNTRY_TO_CONTINENT[continentKey];
  }

  return { name, label: [name, ...parts].join(", "), geo };
}

export default function StopRouteEditor({
  stops,
  onChange,
  onGeoHint,
  overrideRoute,
  onGpxImported,
  onEstimate,
}: {
  stops: NamedStop[];
  onChange: (stops: NamedStop[]) => void;
  onGeoHint?: (geo: DerivedGeo) => void;
  overrideRoute: LatLng[] | null;
  onGpxImported: (
    stops: NamedStop[],
    route: LatLng[],
    estimate: RouteEstimate,
  ) => void;
  onEstimate?: (estimate: RouteEstimate | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [osrmRoute, setOsrmRoute] = useState<[number, number][]>([]);
  const [routing, setRouting] = useState(false);
  const [gpxError, setGpxError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const usingOverride =
    Boolean(overrideRoute && overrideRoute.length >= 2);

  const displayRoute: [number, number][] = usingOverride
    ? (overrideRoute as [number, number][])
    : osrmRoute;

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
        features?: {
          properties: Record<string, string>;
          geometry: { coordinates: [number, number] };
        }[];
      };
      setResults(
        (data.features ?? []).map((feature) => ({
          ...buildResult(feature.properties ?? {}),
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
    if (onGeoHint && Object.keys(result.geo).length > 0) {
      onGeoHint(result.geo);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function removeStop(index: number) {
    onChange(stops.filter((_, i) => i !== index));
  }

  useEffect(() => {
    if (usingOverride) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOsrmRoute([]);
      return;
    }

    let cancelled = false;

    async function fetchRoute() {
      abortRef.current?.abort();
      if (stops.length < 2) {
        setOsrmRoute([]);
        onEstimate?.(null);
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
          setOsrmRoute(
            coordinates.map(([lng, lat]) => [lat, lng] as [number, number]),
          );
          onEstimate?.({
            miles: Math.round(first.distance / 1609.34),
            hours: Math.round((first.duration / 3600) * 10) / 10,
          });
        }
      } catch {
        if (!cancelled) {
          setOsrmRoute(stops.map((stop) => [stop.lat, stop.lng]));
          onEstimate?.(null);
        }
      } finally {
        if (!cancelled) setRouting(false);
      }
    }

    void fetchRoute();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, usingOverride]);

  async function handleGpxFile(file: File) {
    setGpxError(null);
    setImporting(true);
    try {
      const xml = await file.text();
      const parsed = parseGpx(xml);

      const sourcePoints =
        parsed.trackPoints.length >= 2
          ? parsed.trackPoints
          : parsed.waypoints.map(
              (waypoint) => [waypoint.lat, waypoint.lng] as LatLng,
            );

      if (sourcePoints.length < 2) {
        throw new Error("No track or waypoints found in that GPX.");
      }

      const route = downsamplePoints(sourcePoints);
      let importedStops: NamedStop[];

      if (parsed.waypoints.length >= 2) {
        importedStops = parsed.waypoints.slice(0, 8);
      } else {
        importedStops = await nameStopsFromRoute(route);
      }

      const derived = await deriveGeoFromStops(importedStops);
      if (onGeoHint && Object.keys(derived).length > 0) {
        onGeoHint(derived);
      }

      const rawMiles = routeMiles(route as LatLng[]);
      onGpxImported(
        importedStops,
        route as LatLng[],
        {
          miles: Math.max(1, rawMiles),
          hours: Math.max(0.1, Math.round((rawMiles / 38) * 10) / 10),
        },
      );
    } catch (error) {
      setGpxError(
        error instanceof Error ? error.message : "Couldn't read that GPX.",
      );
    } finally {
      setImporting(false);
    }
  }

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
        <RoutePreviewMap route={displayRoute} stops={stops} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold tracking-widest uppercase opacity-70">
        {usingOverride ? (
          <span className="border-2 border-ink bg-accent-green px-2 py-0.5 text-paper">
            Imported track · {displayRoute.length} pts
          </span>
        ) : (
          <span>
            {stops.length < 2
              ? "Search stops or import a GPX to draw the route"
              : routing
                ? "Finding roads…"
                : `${displayRoute.length} road points`}
          </span>
        )}
        {(stops.length > 0 || usingOverride) && (
          <button
            type="button"
            onClick={() => {
              setOsrmRoute([]);
              onChange([]);
            }}
            className="brutal-chip ml-auto cursor-pointer bg-white px-3 py-1 uppercase transition-transform duration-150 hover:-translate-y-0.5"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer border-[3px] border-dashed border-ink bg-paper px-3 py-2 text-xs font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5">
          {importing ? "Parsing…" : "⤒ Import GPX"}
          <input
            type="file"
            accept=".gpx,application/gpx+xml,text/xml,application/xml"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleGpxFile(file);
              event.target.value = "";
            }}
          />
        </label>
        {gpxError && (
          <span className="border-2 border-ink bg-accent-orange px-2 py-1 text-[11px] font-bold normal-case">
            {gpxError}
          </span>
        )}
        {!gpxError && (
          <span className="text-[11px] font-medium normal-case opacity-50">
            Recorded a ride with an app? Drop the file here.
          </span>
        )}
      </div>
    </div>
  );
}
