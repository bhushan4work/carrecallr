import { NextResponse } from "next/server";
import { requireUserId } from "@/src/lib/auth";
import {
  findSavedVehicle,
  setSavedVehicleAlerts,
} from "@/src/models/SavedVehicle";

export async function PATCH(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const vehicleKey = typeof body?.vehicleKey === "string" ? body.vehicleKey : "";
    const alertsEnabled = Boolean(body?.alertsEnabled);

    if (!vehicleKey) {
      return NextResponse.json({ error: "invalid vehicle." }, { status: 400 });
    }

    const existing = await findSavedVehicle(userId, vehicleKey);
    if (!existing) {
      return NextResponse.json({ error: "vehicle not saved." }, { status: 404 });
    }

    const updated = await setSavedVehicleAlerts(
      userId,
      vehicleKey,
      alertsEnabled,
    );

    return NextResponse.json({
      vehicle: {
        vehicleKey,
        alertsEnabled: updated?.alertsEnabled ?? alertsEnabled,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      {
        error: "couldn't update alert settings right now. please try again later.",
      },
      { status: 500 },
    );
  }
}