import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { requireUserId } from "@/src/lib/auth";
import { deleteSavedVehiclesByUser } from "@/src/models/SavedVehicle";
import { deletePushSubscriptionsByUser } from "@/src/models/PushSubscription";
import { deleteAlertEventsByUser } from "@/src/models/AlertEvent";

export const dynamic = "force-dynamic";

export async function DELETE() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "couldn't delete your account right now. please try again later." },
      { status: 500 },
    );
  }

  try {
    await Promise.all([
      deleteSavedVehiclesByUser(userId),
      deletePushSubscriptionsByUser(userId),
      deleteAlertEventsByUser(userId),
    ]);
    const client = await clerkClient();
    await client.users.deleteUser(userId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "couldn't delete your account right now. please try again later." },
      { status: 500 },
    );
  }
}