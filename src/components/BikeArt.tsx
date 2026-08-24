import type { BikeType } from "@/db/schema";
import { BIKE_ICONS } from "./bike-icons";

export default function BikeArt({
  type,
  accent,
}: {
  type: BikeType;
  accent: string;
}) {
  const icon = BIKE_ICONS[type];

  return (
    <div
      role="img"
      aria-label={`${type} motorcycle illustration`}
      className="flex h-full w-full items-center justify-center"
      style={{
        backgroundColor: "var(--color-paper)",
        backgroundImage: `repeating-linear-gradient(45deg, transparent 0px, transparent 16px, ${accent}26 16px, ${accent}26 22px)`,
        color: "#161616",
      }}
    >
      <svg
        viewBox={icon.viewBox}
        className="h-1/2 w-1/2 max-h-28 max-w-[70%]"
        fill="currentColor"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: icon.body }}
      />
    </div>
  );
}
