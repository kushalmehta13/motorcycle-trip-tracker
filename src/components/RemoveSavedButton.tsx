"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SavedTripStatus } from "@/db/schema";
import { toggleSavedTripAction } from "@/app/trips/actions";

export default function RemoveSavedButton({
  tripId,
  status,
}: {
  tripId: number;
  status: SavedTripStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    const result = await toggleSavedTripAction(tripId, status);
    if (result.ok && !result.data.saved) {
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      aria-label="Remove from list"
      className="cursor-pointer border-2 border-ink bg-white px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-colors hover:bg-accent-pink hover:text-paper disabled:opacity-50"
    >
      {busy ? "…" : "×"}
    </button>
  );
}
