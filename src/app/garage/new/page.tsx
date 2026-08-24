import type { Metadata } from "next";
import Link from "next/link";
import NewBikeForm from "@/components/NewBikeForm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Add a bike — MOTO.TRACKER",
};

export default function NewBikePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader active="garage" />

      <main className="mx-auto w-full max-w-3xl grow px-4 pt-10 pb-20 sm:px-6 sm:pt-14">
        <Link
          href="/garage"
          className="text-[11px] font-bold tracking-[0.18em] uppercase opacity-60 transition-opacity hover:opacity-100"
        >
          ← Back to garage
        </Link>

        <h1 className="font-display mt-4 mb-8 text-3xl leading-tight uppercase sm:text-5xl">
          New{" "}
          <span className="brutal-chip inline-block -rotate-1 bg-accent-purple px-3 py-1 text-paper">
            machine
          </span>
        </h1>

        <NewBikeForm />
      </main>

      <SiteFooter />
    </div>
  );
}
