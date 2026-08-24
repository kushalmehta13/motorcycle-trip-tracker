import { updateMileageAction } from "@/app/garage/actions";

export default function MileageForm({ bikeId }: { bikeId: number }) {
  return (
    <form action={updateMileageAction} className="flex items-stretch gap-2">
      <input type="hidden" name="id" value={bikeId} />
      <input
        name="mileage"
        type="number"
        min={0}
        max={2000000}
        required
        aria-label="Update odometer miles"
        placeholder="ODO"
        className="min-w-0 grow border-2 border-ink bg-white px-2 py-1.5 text-xs font-bold placeholder:text-ink/40"
      />
      <button
        type="submit"
        className="border-2 border-ink bg-accent-cyan px-2.5 text-[10px] font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5"
      >
        Log
      </button>
    </form>
  );
}
