"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SavedTripStatus } from "@/db/schema";
import { toggleSavedTripAction } from "@/app/trips/actions";

export default function SavedTripButtons({
  tripId,
  initial,
}: {
  tripId: number;
  initial: SavedTripStatus[];
}) {
  const router = useRouter();
  const [statuses, setStatuses] = useState<SavedTripStatus[]>(initial);
  const [busy, setBusy] = useState<SavedTripStatus | null>(null);

  async function toggle(status: SavedTripStatus) {
    setBusy(status);
    const result = await toggleSavedTripAction(tripId, status);
    setBusy(null);

    if (!result.ok) return;

    const saved = result.data.saved;
    setStatuses((current) =>
      saved
        ? [...current.filter((s) => s !== status), status]
        : current.filter((s) => s !== status),
    );
    router.refresh();
  }

  function buttonClass(status: SavedTripStatus, accent: string) {
    const active = statuses.includes(status);
    return `brutal-chip cursor-pointer px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5 ${
      active ? `${accent} text-paper` : "bg-white"
    }`;
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => toggle("wishlist")}
        className={buttonClass("wishlist", "bg-accent-pink")}
      >
        {statuses.includes("wishlist") ? "✓ Wishlist" : "+ Wishlist"}
      </button>
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => toggle("upcoming")}
        className={buttonClass("upcoming", "bg-accent-teal")}
      >
        {statuses.includes("upcoming") ? "✓ Planned" : "+ Planned"}
      </button>
    </div>
  );
}
