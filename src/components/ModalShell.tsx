"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ModalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [router]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-8"
    >
      <button
        type="button"
        aria-label="Close trip details"
        onClick={() => router.back()}
        className="absolute inset-0 cursor-default bg-ink/70 backdrop-blur-sm"
        tabIndex={-1}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto brutal-card bg-paper shadow-[12px_12px_0_0_var(--color-ink)]">
        <button
          ref={closeRef}
          type="button"
          onClick={() => router.back()}
          aria-label="Close"
          className="brutal-chip absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center bg-accent-pink font-display text-sm transition-transform duration-150 hover:-translate-y-0.5"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
