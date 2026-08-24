"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleOutdatedAction } from "@/app/trips/actions";

export default function OutdatedToggle({
  tripId,
  initialOutdated,
}: {
  tripId: number;
  initialOutdated: boolean;
}) {
  const router = useRouter();
  const [outdated, setOutdated] = useState(initialOutdated);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const result = await toggleOutdatedAction(tripId);
    if (result.ok) {
      setOutdated(result.data.outdated);
      router.refresh();
    }
    setBusy(false);
  }

  return (
    <div className="brutal-card flex flex-wrap items-center justify-between gap-3 bg-white p-4">
      <div>
        <p className="text-sm font-bold uppercase">Road conditions changed?</p>
        <p className="text-xs font-medium opacity-60">
          Flag this ride so riders double-check before they go.
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`brutal-chip cursor-pointer px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-60 ${
          outdated ? "bg-accent-green text-paper" : "bg-accent-orange"
        }`}
      >
        {busy ? "…" : outdated ? "Mark as current" : "Mark as outdated"}
      </button>
    </div>
  );
}
