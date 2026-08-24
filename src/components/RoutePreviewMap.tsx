"use client";

import { Polyline, MapContainer, CircleMarker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { NamedStop } from "@/db/schema";

export default function RoutePreviewMap({
  route,
  stops,
}: {
  route: [number, number][];
  stops: NamedStop[];
}) {
  return (
    <MapContainer
      center={route[0] ?? stops[0] ?? [39.5, -98.35]}
      zoom={stops.length > 0 ? 8 : 4}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        maxZoom={19}
      />
      {route.length > 1 && (
        <>
          <Polyline
            positions={route}
            pathOptions={{ color: "#161616", weight: 8, opacity: 1, lineCap: "round", lineJoin: "round" }}
          />
          <Polyline
            positions={route}
            pathOptions={{ color: "#FF5D8F", weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" }}
          />
        </>
      )}
      {stops.map((stop, index) => (
        <CircleMarker
          key={`${stop.name}-${index}`}
          center={[stop.lat, stop.lng]}
          radius={6}
          pathOptions={{
            color: "#161616",
            weight: 2,
            fillColor: index === 0 ? "#ffffff" : "#FFD02F",
            fillOpacity: 1,
          }}
        />
      ))}
    </MapContainer>
  );
}
