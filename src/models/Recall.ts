import { getDb } from "@/src/lib/db";
import type { Collection, WithId, Document } from "mongodb";
import type { VehicleRecall } from "@/src/types/recall";

export type StoredRecall = VehicleRecall & {
  vehicleKey: string;
  fetchedAt: Date;
};

export type StoredRecallDoc = WithId<Document> & StoredRecall;

export function recallsCollection(): Collection<StoredRecall> {
  return getDb().collection<StoredRecall>("recalls");
}

export async function ensureRecallIndexes(): Promise<void> {
  await recallsCollection().createIndex(
    { vehicleKey: 1, campaignNumber: 1 },
    { unique: true },
  );
}

export async function upsertRecalls(
  vehicleKey: string,
  recalls: VehicleRecall[],
): Promise<void> {
  if (recalls.length === 0) {
    return;
  }
  const now = new Date();
  await recallsCollection().bulkWrite(
    recalls.map((r) => ({
      updateOne: {
        filter: { vehicleKey, campaignNumber: r.campaignNumber },
        update: { $set: { ...r, vehicleKey, fetchedAt: now } },
        upsert: true,
      },
    })),
  );
}

export async function findRecallsByVehicleKeys(
  vehicleKeys: string[],
): Promise<StoredRecallDoc[]> {
  if (vehicleKeys.length === 0) {
    return [];
  }
  return recallsCollection()
    .find({ vehicleKey: { $in: vehicleKeys } })
    .toArray();
}