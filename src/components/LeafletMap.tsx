"use client";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLngBounds } from "leaflet";
import type { LatLngExpression } from "leaflet";

export default function LeafletMap({
  points,
  color,
  interactive = false,
}: {
  points: LatLngExpression[];
  color: string;
  interactive?: boolean;
}) {
  const start = points[0];
  const end = points[points.length - 1];

  if (!start || !end) {
    return null;
  }

  return (
    <MapContainer
      bounds={latLngBounds(points)}
      boundsOptions={{
        padding: interactive ? [28, 28] : [16, 16],
        animate: false,
      }}
      className="h-full w-full"
      zoomControl={interactive}
      attributionControl
      dragging={interactive}
      scrollWheelZoom={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      boxZoom={false}
      keyboard={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains={["a", "b", "c", "d"]}
        maxZoom={19}
      />
      <Polyline
        positions={points}
        pathOptions={{ color: "#161616", weight: 8, opacity: 1, lineCap: "round", lineJoin: "round" }}
      />
      <Polyline
        positions={points}
        pathOptions={{ color, weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" }}
      />
      <CircleMarker
        center={start}
        radius={5}
        pathOptions={{ color: "#161616", weight: 2, fillColor: "#ffffff", fillOpacity: 1 }}
      />
      <CircleMarker
        center={end}
        radius={5}
        pathOptions={{ color: "#161616", weight: 2, fillColor: "#161616", fillOpacity: 1 }}
      />
    </MapContainer>
  );
}
