import type { LatLng, NamedStop } from "@/db/schema";

const OSRM_TIMEOUT_MS = 8000;

export type DerivedGeo = {
  continent?: string;
  country?: string;
  stateProvince?: string;
  region?: string;
};

export const COUNTRY_TO_CONTINENT: Record<string, string> = {
  us: "north-america",
  ca: "north-america",
  mx: "north-america",
  gt: "north-america",
  bz: "north-america",
  hn: "north-america",
  cr: "north-america",
  pa: "north-america",
  cu: "north-america",
  do: "north-america",
  br: "south-america",
  ar: "south-america",
  cl: "south-america",
  pe: "south-america",
  co: "south-america",
  ec: "south-america",
  uy: "south-america",
  bo: "south-america",
  ve: "south-america",
  py: "south-america",
  gb: "europe",
  ie: "europe",
  fr: "europe",
  es: "europe",
  pt: "europe",
  it: "europe",
  de: "europe",
  at: "europe",
  ch: "europe",
  nl: "europe",
  be: "europe",
  lu: "europe",
  no: "europe",
  se: "europe",
  fi: "europe",
  dk: "europe",
  pl: "europe",
  cz: "europe",
  sk: "europe",
  hu: "europe",
  si: "europe",
  hr: "europe",
  rs: "europe",
  ro: "europe",
  bg: "europe",
  gr: "europe",
  tr: "europe",
  jp: "asia",
  in: "asia",
  np: "asia",
  th: "asia",
  vn: "asia",
  my: "asia",
  id: "asia",
  kr: "asia",
  cn: "asia",
  ph: "asia",
  lk: "asia",
  za: "africa",
  na: "africa",
  bw: "africa",
  zw: "africa",
  mz: "africa",
  ke: "africa",
  tz: "africa",
  ug: "africa",
  ma: "africa",
  tn: "africa",
  dz: "africa",
  au: "oceania",
  nz: "oceania",
};

export function slugifyGeoValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<DerivedGeo | null> {
  try {
    const response = await fetch(
      `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
      { signal: AbortSignal.timeout(6000) },
    );
    const data = (await response.json()) as {
      features?: {
        properties?: Record<string, string>;
      }[];
    };
    const props = data.features?.[0]?.properties;
    if (!props) return null;

    const countryCode = (props.countrycode ?? "").toLowerCase();
    const countryName =
      props.country ?? COUNTRY_TO_CONTINENT[countryCode] ?? undefined;

    const geo: DerivedGeo = {};
    if (countryCode && COUNTRY_TO_CONTINENT[countryCode]) {
      geo.continent = COUNTRY_TO_CONTINENT[countryCode];
    }
    if (countryName) geo.country = slugifyGeoValue(countryName);
    if (props.state) geo.stateProvince = slugifyGeoValue(props.state);
    if (props.county) geo.region = slugifyGeoValue(props.county);
    else if (props.city) geo.region = slugifyGeoValue(props.city);

    return geo.continent || geo.country ? geo : null;
  } catch {
    return null;
  }
}

export async function deriveGeoFromStops(
  stops: NamedStop[],
): Promise<DerivedGeo> {
  const candidates = [stops[0], stops[Math.floor(stops.length / 2)], stops[stops.length - 1]];

  for (const stop of candidates) {
    if (!stop) continue;
    const geo = await reverseGeocode(stop.lat, stop.lng);
    if (geo?.continent && geo.country) {
      return geo;
    }
  }

  return {};
}

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
