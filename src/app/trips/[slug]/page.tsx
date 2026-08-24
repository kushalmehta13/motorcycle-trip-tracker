import { notFound } from "next/navigation";
import TripDetail from "@/components/TripDetail";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="catalog" />

      <main className="mx-auto w-full max-w-2xl grow px-4 py-8 sm:px-6 sm:py-12">
        <div className="brutal-card bg-paper shadow-[10px_10px_0_0_var(--color-ink)]">
          <TripDetail trip={trip} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
