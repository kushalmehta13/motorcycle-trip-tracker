import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-md grow px-4 pt-16 pb-20 sm:pt-24">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="brutal-chip inline-block -rotate-2 bg-accent-yellow px-2 py-1 font-display text-base leading-none">
            MOTO
          </span>
          <span className="font-display text-lg tracking-tight">TRACKER</span>
        </Link>

        <h1 className="font-display mb-8 text-center text-3xl uppercase sm:text-4xl">
          Welcome{" "}
          <span className="brutal-chip inline-block -rotate-1 bg-accent-pink px-3 py-0.5 text-paper">
            back
          </span>
        </h1>

        <SignIn
          signUpUrl="/sign-up"
          forceRedirectUrl="/garage"
          appearance={clerkAppearance}
        />
      </div>
    </div>
  );
}
