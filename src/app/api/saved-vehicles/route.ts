import { NextResponse } from "next/server";
import { requireUserId } from "@/src/lib/auth";
import {
  findSavedVehicles,
  removeSavedVehicle,
  saveVehicle,
} from "@/src/models/SavedVehicle";

export async function GET() {
  try {
    const userId = await requireUserId();
    const vehicles = await findSavedVehicles(userId);
    return NextResponse.json({
      vehicles: vehicles.map((v) => ({
        vehicleKey: v.vehicleKey,
        make: v.make,
        model: v.model,
        modelYear: v.modelYear,
        alertsEnabled: v.alertsEnabled,
        createdAt: v.createdAt,
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "couldn't load saved vehicles right now. please try again later." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();
    const body = await request.json();
    const make = typeof body?.make === "string" ? body.make.trim() : "";
    const model = typeof body?.model === "string" ? body.model.trim() : "";
    const modelYear = Number(body?.modelYear);

    if (!make || !model || !Number.isInteger(modelYear) || modelYear < 1900 || modelYear > 2100) {
      return NextResponse.json(
        { error: "invalid vehicle parameters." },
        { status: 400 },
      );
    }

    const vehicleKey = `${make.toLowerCase()}:${model.toLowerCase()}:${modelYear}`;
    const saved = await saveVehicle({
      userId,
      vehicleKey,
      make,
      model,
      modelYear,
    });

    return NextResponse.json({
      vehicle: {
        vehicleKey: saved.vehicleKey,
        make: saved.make,
        model: saved.model,
        modelYear: saved.modelYear,
        alertsEnabled: saved.alertsEnabled,
        createdAt: saved.createdAt,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "couldn't save the vehicle right now. please try again later." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(request.url);
    const vehicleKey = searchParams.get("vehicleKey");

    if (!vehicleKey) {
      return NextResponse.json({ error: "invalid vehicle." }, { status: 400 });
    }

    await removeSavedVehicle(userId, vehicleKey);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.name === "UnauthorizedError") {
      return NextResponse.json({ error: "unauthorized." }, { status: 401 });
    }
    return NextResponse.json(
      { error: "couldn't remove the vehicle right now. please try again later." },
      { status: 500 },
    );
  }
}