import type { LatLng, NamedStop } from "@/db/schema";

const OSRM_TIMEOUT_MS = 8000;

export async function routeFromStops(
  stops: NamedStop[],
): Promise<{ route: LatLng[]; source: "osrm" | "straight" }> {
  if (stops.length < 2) {
    return {
      route: stops.map((stop) => [stop.lat, stop.lng] as LatLng),
      source: "straight",
    };
  }

  const coords = stops
    .map((stop) => `${stop.lng.toFixed(6)},${stop.lat.toFixed(6)}`)
    .join(";");

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`,
      { signal: AbortSignal.timeout(OSRM_TIMEOUT_MS) },
    );
    const data = (await response.json()) as {
      routes?: { geometry?: { coordinates?: [number, number][] } }[];
    };
    const coordinates = data.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(coordinates) && coordinates.length >= 2) {
      return {
        route: coordinates.map(
          ([lng, lat]) =>
            [Math.round(lat * 100000) / 100000, Math.round(lng * 100000) / 100000] as LatLng,
        ),
        source: "osrm",
      };
    }
  } catch {
    // fall through to straight-line fallback
  }

  return {
    route: stops.map((stop) => [stop.lat, stop.lng] as LatLng),
    source: "straight",
  };
}
