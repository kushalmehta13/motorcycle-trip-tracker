import { notFound } from "next/navigation";
import ModalShell from "@/components/ModalShell";
import TripDetail from "@/components/TripDetail";
import { getTripBySlug } from "@/lib/trips";

export const dynamic = "force-dynamic";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  return (
    <ModalShell>
      <TripDetail trip={trip} />
    </ModalShell>
  );
}
