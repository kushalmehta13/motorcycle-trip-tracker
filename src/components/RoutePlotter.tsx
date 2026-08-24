"use client";

import dynamic from "next/dynamic";

const RouteBuilderMap = dynamic(() => import("./RouteBuilderMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper">
      <span className="font-display text-[11px] tracking-[0.2em] uppercase opacity-60">
        Loading map…
      </span>
    </div>
  ),
});

function haversineMiles(a: [number, number], b: [number, number]): number {
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

export default function RoutePlotter({
  points,
  onPointsChange,
}: {
  points: [number, number][];
  onPointsChange: (points: [number, number][]) => void;
}) {
  const straightLine = points.reduce(
    (sum, point, index) =>
      index === 0 ? sum : sum + haversineMiles(points[index - 1], point),
    0,
  );
  const estimate = Math.round(straightLine * 1.3);

  return (
    <div>
      <div className="h-72 border-[3px] border-ink sm:h-96">
        <RouteBuilderMap
          points={points}
          onAdd={(point) => onPointsChange([...points, point])}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold tracking-widest uppercase opacity-60">
          {points.length === 0
            ? "Tap the map to drop your start point"
            : `${points.length} point${points.length === 1 ? "" : "s"} plotted`}
        </span>
        {estimate > 0 && (
          <span className="border-2 border-ink bg-paper px-2 py-0.5 text-[11px] font-bold">
            ≈ {estimate} mi along the route
          </span>
        )}
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            disabled={points.length === 0}
            onClick={() => onPointsChange(points.slice(0, -1))}
            className="brutal-chip cursor-pointer bg-white px-3 py-1 text-[11px] font-bold uppercase transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Undo
          </button>
          <button
            type="button"
            disabled={points.length === 0}
            onClick={() => onPointsChange([])}
            className="brutal-chip cursor-pointer bg-white px-3 py-1 text-[11px] font-bold uppercase transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
