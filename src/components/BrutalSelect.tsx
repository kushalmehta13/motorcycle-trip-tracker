"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { useMemo } from "react";

export type BrutalSelectOption = { value: string; label: string };

const triggerBase =
  "flex w-full cursor-pointer items-center justify-between gap-2 border-[3px] border-ink bg-white text-left font-bold uppercase tracking-wide transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:outline-[3px] focus-visible:outline-accent-pink data-[state=open]:-translate-y-0.5";

const contentBase =
  "z-1000 max-h-72 overflow-y-auto border-[3px] border-ink bg-white shadow-[6px_6px_0_0_var(--color-ink)]";

const itemBase =
  "relative flex cursor-pointer select-none items-center justify-between px-3 py-2 text-xs font-bold uppercase tracking-wide outline-none data-[highlighted]:bg-accent-yellow data-[state=checked]:bg-paper";

function Chevron() {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 14 9"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M1.5 1.5l5.5 5.5 5.5-5.5"
        fill="none"
        stroke="#161616"
        strokeWidth="3"
      />
    </svg>
  );
}

export default function BrutalSelect({
  options,
  value,
  onValueChange,
  ariaLabel,
  id,
  name,
  size = "compact",
  className = "",
  placeholder,
}: {
  options: BrutalSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel?: string;
  id?: string;
  name?: string;
  size?: "compact" | "field";
  className?: string;
  placeholder?: string;
}) {
  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const triggerClass =
    size === "field"
      ? `${triggerBase} px-3 py-2.5 text-sm`
      : `${triggerBase} px-2.5 py-2 text-xs`;

  return (
    <>
      <SelectPrimitive.Root
        value={value || undefined}
        onValueChange={onValueChange}
      >
        <SelectPrimitive.Trigger
          id={id}
          aria-label={ariaLabel}
          className={`${triggerClass} ${className}`}
        >
          <span
            className={`truncate ${!value && placeholder ? "font-medium normal-case tracking-normal text-ink/40" : ""}`}
          >
            {value
              ? (selected?.label ?? "")
              : (placeholder ?? selected?.label ?? "")}
          </span>
          <Chevron />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className={`${contentBase} min-w-[var(--radix-select-trigger-width)]`}
          >
            <SelectPrimitive.Viewport>
              {options.map((option) => (
                <SelectPrimitive.Item
                  key={option.value}
                  value={option.value}
                  className={itemBase}
                >
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator>
                    <svg
                      width="12"
                      height="10"
                      viewBox="0 0 12 10"
                      aria-hidden="true"
                    >
                      <path
                        d="M1 5.5L4.2 8.5L11 1.5"
                        fill="none"
                        stroke="#161616"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {name && <input type="hidden" name={name} value={value} />}
    </>
  );
}
