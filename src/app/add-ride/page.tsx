import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import CommunityTripForm from "@/components/CommunityTripForm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share a ride — MOTO.TRACKER",
};

export default async function AddRidePage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/add-ride");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="catalog" />

      <main className="mx-auto w-full max-w-3xl grow px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <Link
          href="/"
          className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-60 transition-opacity hover:opacity-100"
        >
          ← Back to catalog
        </Link>

        <h1 className="font-display mt-4 mb-3 text-3xl leading-tight uppercase sm:text-5xl">
          Share a{" "}
          <span className="brutal-chip inline-block -rotate-1 bg-accent-yellow px-3 py-0.5 text-paper">
            ride
          </span>
        </h1>
        <p className="mb-8 max-w-md text-sm font-medium leading-relaxed opacity-80">
          Search stops, let the roads draw themselves, and tell it like it is.
        </p>

        <CommunityTripForm mode="create" />
      </main>

      <SiteFooter />
    </div>
  );
}
