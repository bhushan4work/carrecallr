import { NextResponse } from "next/server";
import { requireUserId } from "@/src/lib/auth";
import {
  createPushSubscription,
  deletePushSubscription,
} from "@/src/models/PushSubscription";
import type webpush from "web-push";

function parseSubscription(body: unknown): webpush.PushSubscription | null {
  if (!body || typeof body !== "object") return null;
  const sub = body as {
    endpoint?: unknown;
    expirationTime?: unknown;
    keys?: { p256dh?: unknown; auth?: unknown };
  };
  if (
    typeof sub.endpoint !== "string" ||
    !sub.endpoint.startsWith("http") ||
    typeof sub.keys?.p256dh !== "string" ||
    typeof sub.keys?.auth !== "string"
  ) {
    return null;
  }
  return {
    endpoint: sub.endpoint,
    expirationTime: typeof sub.expirationTime === "number" ? sub.expirationTime : null,
    keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
  };
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json().catch(() => null);
    const subscription = parseSubscription(body);
    if (!subscription) {
      return NextResponse.json(
        { error: "invalid push subscription." },
        { status: 400 },
      );
    }
    await createPushSubscription(userId, subscription);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "couldn't save the notification subscription right now. please try again later." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    if (!endpoint) {
      return NextResponse.json({ error: "invalid subscription." }, { status: 400 });
    }
    await deletePushSubscription(userId, endpoint);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "couldn't remove the notification subscription right now. please try again later." },
      { status: 500 },
    );
  }
}