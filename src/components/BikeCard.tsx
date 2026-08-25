import type { Bike } from "@/db/schema";
import { accentForBike, bikeTypeLabel } from "@/lib/bikes";
import BikeArt from "./BikeArt";
import MileageForm from "./MileageForm";

export default function BikeCard({ bike }: { bike: Bike }) {
  const accent = accentForBike(bike.type);

  return (
    <article className="brutal-card flex flex-col bg-white transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_var(--color-ink)]">
      <div className="h-52 shrink-0 border-b-[3px] border-ink bg-paper">
        {bike.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bike.imageUrl}
            alt={`${bike.year} ${bike.make} ${bike.model}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <BikeArt type={bike.type} accent={accent} />
        )}
      </div>

      <div className="flex grow flex-col gap-3 p-5">
        <span
          className="brutal-chip self-start px-2 py-1 text-[11px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: accent }}
        >
          {bikeTypeLabel(bike.type)}
        </span>

        <h2 className="font-display text-xl leading-tight uppercase">{bike.nickname}</h2>
        <p className="text-sm font-medium opacity-80">
          {bike.year} {bike.make} {bike.model}
        </p>

        {bike.notes && (
          <p className="border-l-4 border-ink pl-3 text-xs leading-relaxed font-medium opacity-70">
            {bike.notes}
          </p>
        )}

        <div className="mt-auto grid grid-cols-2 border-[3px] border-ink text-center font-display text-sm">
          <div className="border-r-[3px] border-ink py-2.5">
            {bike.mileage.toLocaleString("en-US")} MI
          </div>
          <div className="py-2.5">{bike.year}</div>
        </div>

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-[10px] font-bold tracking-widest uppercase opacity-60">
            Odo
          </span>
          <MileageForm bikeId={bike.id} />
        </div>
      </div>
    </article>
  );
}
