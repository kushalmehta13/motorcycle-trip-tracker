"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "@/app/trips/actions";

export default function ReviewForm({
  tripId,
  initialRating,
  initialComment,
}: {
  tripId: number;
  initialRating?: number;
  initialComment?: string | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [comment, setComment] = useState(initialComment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    if (rating === 0) {
      setError("Tap the blocks to rate this ride.");
      return;
    }
    setBusy(true);
    const result = await submitReviewAction(tripId, rating, comment);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.refresh();
    setBusy(false);
  }

  return (
    <div className="border-[3px] border-dashed border-ink bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase opacity-60">
          Your rating
        </span>
        <div className="flex gap-1.5" role="radiogroup" aria-label="Your rating">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={rating === level}
              aria-label={`${level} of 5`}
              onClick={() => setRating(level)}
              className={`h-7 w-7 cursor-pointer border-[3px] border-ink transition-transform duration-100 hover:-translate-y-0.5 ${
                level <= rating ? "bg-accent-yellow" : "bg-paper"
              }`}
            />
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        maxLength={600}
        placeholder={
          rating >= 4
            ? "What made it great? (optional)"
            : "Heads-up for other riders? (optional)"
        }
        className="mt-3 w-full border-[3px] border-ink bg-paper px-3 py-2 text-sm font-medium placeholder:text-ink/40 focus:outline-none focus-visible:outline-none"
      />

      {error && (
        <p className="mt-2 text-xs font-bold text-accent-pink">{error}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="brutal-chip mt-3 w-full cursor-pointer bg-accent-yellow px-3 py-2 text-xs font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Posting…" : initialRating ? "Update report" : "Post ride report"}
      </button>
    </div>
  );
}
