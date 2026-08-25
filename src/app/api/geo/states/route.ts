import { NextResponse } from "next/server";
import { getGeoBuckets } from "@/lib/trips";
import { getReferenceStates } from "@/lib/geo-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const country = url.searchParams.get("country");

  if (!country) {
    return NextResponse.json({ states: [] });
  }

  const reference = getReferenceStates(country);

  try {
    const buckets = await getGeoBuckets("state", { country });
    const merged = new Set([...reference, ...buckets.map((b) => b.value)]);
    return NextResponse.json({
      states: [...merged].sort((a, b) => a.localeCompare(b)),
    });
  } catch {
    return NextResponse.json({ states: reference });
  }
}
