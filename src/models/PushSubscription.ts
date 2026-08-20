import { getDb } from "@/src/lib/db";
import type { Collection, WithId, Document } from "mongodb";
import type webpush from "web-push";

export type PushSubscription = {
  userId: string;
  endpoint: string;
  subscription: webpush.PushSubscription;
  createdAt: Date;
};

export type PushSubscriptionDoc = WithId<Document> & PushSubscription;

export function pushSubscriptionsCollection(): Collection<PushSubscription> {
  return getDb().collection<PushSubscription>("pushSubscriptions");
}

export async function createPushSubscription(
  userId: string,
  subscription: webpush.PushSubscription,
): Promise<PushSubscriptionDoc> {
  const doc: PushSubscription = {
    userId,
    endpoint: subscription.endpoint,
    subscription,
    createdAt: new Date(),
  };
  await pushSubscriptionsCollection().updateOne(
    { userId, endpoint: subscription.endpoint },
    { $set: doc },
    { upsert: true },
  );
  const saved = await pushSubscriptionsCollection().findOne({
    userId,
    endpoint: subscription.endpoint,
  });
  if (!saved) {
    throw new Error("failed to save push subscription.");
  }
  return saved;
}

export async function findPushSubscriptionsByUser(
  userId: string,
): Promise<PushSubscriptionDoc[]> {
  return pushSubscriptionsCollection().find({ userId }).toArray();
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
): Promise<boolean> {
  const result = await pushSubscriptionsCollection().deleteOne({
    userId,
    endpoint,
  });
  return result.deletedCount > 0;
}

export async function deletePushSubscriptionById(id: unknown): Promise<boolean> {
  const result = await pushSubscriptionsCollection().deleteOne({
    _id: id as never,
  });
  return result.deletedCount > 0;
}