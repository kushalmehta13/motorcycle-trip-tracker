export default function RatingBlocks({
  value,
  out = 5,
  accent = "#FFD02F",
  size = "md",
}: {
  value: number;
  out?: number;
  accent?: string;
  size?: "sm" | "md";
}) {
  const filled = Math.round(value);
  const boxClass =
    size === "sm"
      ? "inline-block h-2.5 w-2.5 border-[1.5px] border-ink"
      : "inline-block h-3.5 w-3.5 border-2 border-ink";

  return (
    <span className="inline-flex gap-[3px]" aria-hidden="true">
      {Array.from({ length: out }, (_, i) => (
        <span
          key={i}
          className={boxClass}
          style={{
            backgroundColor: i < filled ? accent : "var(--color-paper)",
          }}
        />
      ))}
    </span>
  );
}
