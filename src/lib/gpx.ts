import type { LatLng, NamedStop } from "@/db/schema";

export type GpxParseResult = {
  name: string | null;
  trackPoints: LatLng[];
  waypoints: NamedStop[];
};

const MAX_ROUTE_POINTS = 400;

export function parseGpx(xml: string): GpxParseResult {
  const doc = new DOMParser().parseFromString(xml, "application/xml");

  if (doc.querySelector("parsererror")) {
    throw new Error("That file isn't valid GPX.");
  }

  const trackPoints: LatLng[] = [];
  doc.querySelectorAll("trkpt").forEach((point) => {
    const lat = Number(point.getAttribute("lat"));
    const lng = Number(point.getAttribute("lon"));
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      trackPoints.push([lat, lng]);
    }
  });

  const waypoints: NamedStop[] = [];
  doc.querySelectorAll("wpt").forEach((point) => {
    const lat = Number(point.getAttribute("lat"));
    const lng = Number(point.getAttribute("lon"));
    const name =
      point.querySelector("name")?.textContent?.trim() ??
      `Waypoint ${waypoints.length + 1}`;
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      waypoints.length < 20
    ) {
      waypoints.push({ name: name.slice(0, 80), lat, lng });
    }
  });

  const name =
    doc.querySelector("metadata > name")?.textContent?.trim() ??
    doc.querySelector("trk > name")?.textContent?.trim() ??
    doc.querySelector("rte > name")?.textContent?.trim() ??
    null;

  return { name, trackPoints, waypoints };
}

export function downsamplePoints(
  points: LatLng[],
  max = MAX_ROUTE_POINTS,
): LatLng[] {
  if (points.length <= max) return points;
  const step = Math.ceil(points.length / max);
  const output = points.filter((_, index) => index % step === 0);
  const last = points[points.length - 1];
  const lastOut = output[output.length - 1];
  if (last && lastOut && (last[0] !== lastOut[0] || last[1] !== lastOut[1])) {
    output.push(last);
  }
  return output;
}

export function haversineMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function routeMiles(route: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineMiles(route[i - 1], route[i]);
  }
  return Math.round(total);
}

export async function nameStopsFromRoute(
  route: LatLng[],
  maxStops = 5,
): Promise<NamedStop[]> {
  if (route.length === 0) return [];

  const indices = new Set<number>([0, route.length - 1]);
  const inner = Math.min(maxStops - 2, 3);
  for (let i = 1; i <= inner; i++) {
    indices.add(Math.round((route.length - 1) * (i / (inner + 1))));
  }

  const stops: NamedStop[] = [];
  const ordered = [...indices].sort((a, b) => a - b);

  for (const index of ordered) {
    const [lat, lng] = route[index];
    let label = "";
    try {
      const response = await fetch(
        `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`,
        { signal: AbortSignal.timeout(4000) },
      );
      const data = (await response.json()) as {
        features?: { properties?: Record<string, string> }[];
      };
      const props = data.features?.[0]?.properties ?? {};
      label =
        props.city ??
        props.county ??
        props.name ??
        props.state ??
        "";
    } catch {
      label = "";
    }
    stops.push({
      name:
        (label || `Point ${stops.length + 1}`).slice(0, 80),
      lat,
      lng,
    });
  }

  if (stops.length > 0) {
    stops[0].name = stops[0].name.match(/^Point \d+$/)
      ? "Start"
      : stops[0].name;
    const lastStop = stops[stops.length - 1];
    if (lastStop.name.match(/^Point \d+$/)) lastStop.name = "End";
  }

  return stops;
}
