import { NextResponse } from "next/server";
import { getGeoBuckets } from "@/lib/trips";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const country = url.searchParams.get("country");

  if (!country) {
    return NextResponse.json({ states: [] });
  }

  try {
    const states = await getGeoBuckets("state", { country });
    return NextResponse.json({ states });
  } catch {
    return NextResponse.json({ states: [] });
  }
}
