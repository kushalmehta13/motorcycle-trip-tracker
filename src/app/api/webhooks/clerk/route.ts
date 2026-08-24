import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { Webhook } from "svix";
import { getDb } from "@/db";
import { bikes } from "@/db/schema";

type ClerkEvent = {
  type: string;
  data: { id?: string };
};

export async function POST(req: Request): Promise<Response> {
  const webhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SIGNING_SECRET is not set");
    return new Response("Webhook not configured", { status: 500 });
  }

  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: ClerkEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "user.deleted" && event.data.id) {
    const userId = event.data.id;
    const db = getDb();

    const ownedBikes = await db
      .select()
      .from(bikes)
      .where(eq(bikes.userId, userId));

    const photoUrls = ownedBikes
      .map((bike) => bike.imageUrl)
      .filter((url): url is string => Boolean(url));

    if (photoUrls.length > 0) {
      await del(photoUrls);
    }

    await db.delete(bikes).where(eq(bikes.userId, userId));

    console.log(
      `Wiped garage for deleted user ${userId}: ${ownedBikes.length} bikes, ${photoUrls.length} photos`,
    );
  }

  return new Response(null, { status: 200 });
}
