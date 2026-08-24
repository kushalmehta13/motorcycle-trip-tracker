"use client";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngExpression } from "leaflet";

function ClickCatcher({ onAdd }: { onAdd: (point: [number, number]) => void }) {
  useMapEvents({
    click(event) {
      onAdd([
        Math.round(event.latlng.lat * 10000) / 10000,
        Math.round(event.latlng.lng * 10000) / 10000,
      ]);
    },
  });
  return null;
}

export default function RouteBuilderMap({
  points,
  onAdd,
}: {
  points: [number, number][];
  onAdd: (point: [number, number]) => void;
}) {
  return (
    <MapContainer
      center={points[0] ?? [39.5, -98.35]}
      zoom={points.length > 0 ? 9 : 4}
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        maxZoom={19}
      />
      {points.length > 1 && (
        <Polyline
          positions={points as LatLngExpression[]}
          pathOptions={{ color: "#FF5D8F", weight: 4, opacity: 1 }}
        />
      )}
      {points.map((point, index) => (
        <CircleMarker
          key={`${point[0]}-${point[1]}-${index}`}
          center={point}
          radius={6}
          pathOptions={{
            color: "#161616",
            weight: 2,
            fillColor: index === 0 ? "#ffffff" : "#FFD02F",
            fillOpacity: 1,
          }}
        />
      ))}
      <ClickCatcher onAdd={onAdd} />
    </MapContainer>
  );
}
