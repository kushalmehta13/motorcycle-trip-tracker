"use client";

import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

const ClientMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper">
      <span className="font-display text-[11px] tracking-[0.2em] uppercase opacity-60">
        Loading map…
      </span>
    </div>
  ),
});

export default function RouteMap({
  points,
  color,
}: {
  points: LatLngExpression[];
  color: string;
}) {
  return <ClientMap points={points} color={color} />;
}
