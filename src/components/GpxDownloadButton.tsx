"use client";

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default function GpxDownloadButton({
  name,
  slug,
  points,
}: {
  name: string;
  slug: string;
  points: [number, number][];
}) {
  function download() {
    const trkpts = points
      .map(([lat, lon]) => `      <trkpt lat="${lat}" lon="${lon}"></trkpt>`)
      .join("\n");

    const safeName = escapeXml(name);
    const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MOTO.TRACKER" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
  </metadata>
  <trk>
    <name>${safeName}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>
`;

    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug}.gpx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="brutal-chip w-full bg-accent-yellow px-4 py-3 font-display text-sm tracking-widest uppercase transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_0_var(--color-ink)]"
    >
      ⤓ Download route · GPX
    </button>
  );
}
