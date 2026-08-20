import { getDb } from "@/src/lib/db";
import type { Collection, WithId, Document } from "mongodb";

export type AlertEvent = {
  userId: string;
  vehicleKey: string;
  campaignNumber: string;
  sentAt: Date;
};

export type AlertEventDoc = WithId<Document> & AlertEvent;

export function alertEventsCollection(): Collection<AlertEvent> {
  return getDb().collection<AlertEvent>("alertEvents");
}

export async function ensureAlertEventIndexes(): Promise<void> {
  await alertEventsCollection().createIndex(
    { userId: 1, vehicleKey: 1, campaignNumber: 1 },
    { unique: true },
  );
}

export async function findNotifiedCampaigns(
  userId: string,
  vehicleKey: string,
): Promise<Set<string>> {
  const events = await alertEventsCollection()
    .find({ userId, vehicleKey }, { projection: { campaignNumber: 1 } })
    .toArray();
  return new Set(events.map((e) => e.campaignNumber));
}

export async function recordAlertEvent(
  userId: string,
  vehicleKey: string,
  campaignNumber: string,
): Promise<void> {
  await alertEventsCollection().insertOne({
    userId,
    vehicleKey,
    campaignNumber,
    sentAt: new Date(),
  });
}