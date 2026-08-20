import { getDb } from "@/src/lib/db";
import type { Collection, WithId, Document } from "mongodb";

export type SavedVehicle = {
  userId: string;
  vehicleKey: string;
  make: string;
  model: string;
  modelYear: number;
  alertsEnabled: boolean;
  createdAt: Date;
  lastCheckedAt?: Date;
};

export type SavedVehicleDoc = WithId<Document> & SavedVehicle;

export function savedVehiclesCollection(): Collection<SavedVehicle> {
  return getDb().collection<SavedVehicle>("savedVehicles");
}

export async function findSavedVehicles(
  userId: string,
): Promise<SavedVehicleDoc[]> {
  return savedVehiclesCollection()
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
}

export async function findSavedVehicle(
  userId: string,
  vehicleKey: string,
): Promise<SavedVehicleDoc | null> {
  return savedVehiclesCollection().findOne({ userId, vehicleKey });
}

export async function saveVehicle(input: {
  userId: string;
  vehicleKey: string;
  make: string;
  model: string;
  modelYear: number;
}): Promise<SavedVehicleDoc> {
  const doc: SavedVehicle = {
    ...input,
    alertsEnabled: true,
    createdAt: new Date(),
  };
  await savedVehiclesCollection().updateOne(
    { userId: input.userId, vehicleKey: input.vehicleKey },
    { $setOnInsert: doc },
    { upsert: true },
  );
  const saved = await findSavedVehicle(input.userId, input.vehicleKey);
  if (!saved) {
    throw new Error("failed to save vehicle.");
  }
  return saved;
}

export async function removeSavedVehicle(
  userId: string,
  vehicleKey: string,
): Promise<boolean> {
  const result = await savedVehiclesCollection().deleteOne({
    userId,
    vehicleKey,
  });
  return result.deletedCount > 0;
}

export async function deleteSavedVehiclesByUser(
  userId: string,
): Promise<void> {
  await savedVehiclesCollection().deleteMany({ userId });
}

export async function findAllSavedVehicles(): Promise<SavedVehicleDoc[]> {
  return savedVehiclesCollection()
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
}

export async function setSavedVehicleLastChecked(
  userId: string,
  vehicleKey: string,
  checkedAt: Date,
): Promise<void> {
  await savedVehiclesCollection().updateOne(
    { userId, vehicleKey },
    { $set: { lastCheckedAt: checkedAt } },
  );
}

export async function setSavedVehicleAlerts(
  userId: string,
  vehicleKey: string,
  alertsEnabled: boolean,
): Promise<SavedVehicleDoc | null> {
  await savedVehiclesCollection().updateOne(
    { userId, vehicleKey },
    { $set: { alertsEnabled } },
  );
  return findSavedVehicle(userId, vehicleKey);
}