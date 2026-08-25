import Link from "next/link";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function SiteHeader({
  active,
}: {
  active: "catalog" | "garage";
}) {
  const { userId } = await auth();

  return (
    <header className="sticky top-0 z-50 border-b-4 border-ink bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="brutal-chip inline-block bg-accent-yellow px-2 py-1 font-display text-base leading-none">
            MOTO
          </span>
          <span className="font-display text-lg tracking-tight">TRACKER</span>
        </Link>

        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-6 text-xs font-bold tracking-[0.18em] uppercase">
            <Link
              href="/"
              aria-current={active === "catalog" ? "page" : undefined}
              className={`pb-0.5 transition-opacity ${
                active === "catalog"
                  ? "border-b-[3px] border-accent-pink"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              Catalog
            </Link>
            {userId && (
              <Link
                href="/garage"
                aria-current={active === "garage" ? "page" : undefined}
                className={`pb-0.5 transition-opacity ${
                  active === "garage"
                    ? "border-b-[3px] border-accent-teal"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                Garage
              </Link>
            )}
            <span className="hidden opacity-40 sm:inline">Log</span>
          </nav>

          {userId ? (
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "h-9 w-9 border-2 border-ink shadow-[2px_2px_0_0_#161616] rounded-none",
                },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="brutal-chip cursor-pointer bg-white px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase transition-transform duration-150 hover:-translate-y-0.5"
              >
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t-4 border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-[11px] font-bold tracking-[0.18em] uppercase sm:px-6">
        <span>MOTO.TRACKER © 2026</span>
        <span className="opacity-70">Built for the long way home</span>
      </div>
    </footer>
  );
}
