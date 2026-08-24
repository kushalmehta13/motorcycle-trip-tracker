"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { BIKE_TYPES, type BikeType } from "@/db/schema";
import { addBikeAction } from "@/app/garage/actions";
import BrutalSelect from "./BrutalSelect";

const inputClass =
  "w-full border-[3px] border-ink bg-white px-3 py-2.5 text-sm font-medium placeholder:text-ink/40 focus:outline-none focus-visible:outline-none focus:border-accent-pink";
const labelClass =
  "block text-[11px] font-bold tracking-[0.18em] uppercase mb-1.5";

export default function NewBikeForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [bikeType, setBikeType] = useState<BikeType>("sport");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onPhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const year = Number(form.get("year"));
    const mileage = Number(form.get("mileage") || 0);

    if (!form.get("nickname") || !form.get("make") || !form.get("model")) {
      setError("Nickname, make, and model are required.");
      return;
    }
    if (Number.isNaN(year)) {
      setError("Year must be a number.");
      return;
    }

    setBusy(true);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        const blob = await upload(photo.name, photo, {
          access: "private",
          handleUploadUrl: "/api/blob-upload",
        });
        imageUrl = blob.url;
      }

      const result = await addBikeAction({
        type: bikeType,
        nickname: String(form.get("nickname")),
        make: String(form.get("make")),
        model: String(form.get("model")),
        year,
        mileage,
        notes: String(form.get("notes") || ""),
        imageUrl,
      });

      if (!result.ok) {
        setError(result.error);
        setBusy(false);
        return;
      }

      router.push("/garage");
    } catch {
      setError(
        photo
          ? "Photo upload failed — is Vercel Blob connected? Try again or submit without a photo."
          : "Something went wrong. Try again.",
      );
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="brutal-card bg-white p-5 sm:p-7">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="nickname" className={labelClass}>
            Nickname *
          </label>
          <input id="nickname" name="nickname" className={inputClass} placeholder="The Blue Comet" maxLength={40} />
        </div>
        <div>
          <label htmlFor="type" className={labelClass}>
            Type
          </label>
          <BrutalSelect
            id="type"
            name="type"
            size="field"
            ariaLabel="Bike type"
            options={BIKE_TYPES.map((t) => ({
              value: t,
              label: t.charAt(0).toUpperCase() + t.slice(1),
            }))}
            value={bikeType}
            onValueChange={(value) => setBikeType(value as BikeType)}
          />
        </div>
        <div>
          <label htmlFor="make" className={labelClass}>
            Make *
          </label>
          <input id="make" name="make" className={inputClass} placeholder="Royal Enfield" maxLength={30} />
        </div>
        <div>
          <label htmlFor="model" className={labelClass}>
            Model *
          </label>
          <input id="model" name="model" className={inputClass} placeholder="Interceptor 650" maxLength={40} />
        </div>
        <div>
          <label htmlFor="year" className={labelClass}>
            Year *
          </label>
          <input id="year" name="year" type="number" min={1930} max={new Date().getFullYear() + 1} className={inputClass} placeholder="2024" />
        </div>
        <div>
          <label htmlFor="mileage" className={labelClass}>
            Odometer (miles)
          </label>
          <input id="mileage" name="mileage" type="number" min={0} className={inputClass} placeholder="12480" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="notes" className={labelClass}>
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            maxLength={200}
            className={inputClass}
            placeholder="New chain, crash bars fitted, hates cold starts…"
          />
        </div>

        <div className="sm:col-span-2">
          <span className={labelClass}>Photo (optional)</span>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-36 w-full shrink-0 overflow-hidden border-[3px] border-ink bg-paper sm:w-56">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Bike preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-center text-[11px] font-bold tracking-widest uppercase opacity-50">
                  Art is generated
                  <br />
                  from bike type
                </div>
              )}
            </div>
            <div className="grow">
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={onPhotoChange}
                className="w-full cursor-pointer border-[3px] border-dashed border-ink bg-paper px-3 py-3 text-sm font-medium file:mr-3 file:border-2 file:border-ink file:bg-accent-yellow file:px-2.5 file:py-1.5 file:text-xs file:font-bold file:uppercase"
              />
              <p className="mt-2 text-[11px] font-medium opacity-60">
                JPG / PNG / WebP up to 8 MB. Skip it and we&apos;ll draw your ride.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-5 border-[3px] border-ink bg-accent-orange px-4 py-3 text-sm font-bold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="brutal-chip mt-6 w-full bg-accent-yellow px-4 py-3.5 font-display text-sm tracking-widest uppercase transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--color-ink)] disabled:cursor-wait disabled:opacity-70"
      >
        {busy ? "Parking it…" : "Add to garage"}
      </button>
    </form>
  );
}
