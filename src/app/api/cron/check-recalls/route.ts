import { NextResponse } from "next/server";
import {
  sendPushNotification,
  PushSubscriptionGoneError,
} from "@/src/lib/push";
import { getVehicleRecalls } from "@/src/lib/nhtsa/recalls";
import {
  findSavedVehiclesWithAlertsEnabled,
  type SavedVehicleDoc,
} from "@/src/models/SavedVehicle";
import {
  findPushSubscriptionsByUser,
  deletePushSubscriptionById,
} from "@/src/models/PushSubscription";
import {
  ensureAlertEventIndexes,
  findNotifiedCampaigns,
  recordAlertEvent,
} from "@/src/models/AlertEvent";
import type { VehicleRecall } from "@/src/types/recall";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }
  return request.headers.get("x-cron-secret") === secret;
}

function summarize(text: string, max = 160): string {
  const clean = text.trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized." }, { status: 401 });
  }

  const origin = new URL(request.url).origin;
  const stats = {
    users: 0,
    vehiclesChecked: 0,
    newRecallsFound: 0,
    notificationsSent: 0,
    duplicatesSkipped: 0,
    errors: 0,
  };

  try {
    await ensureAlertEventIndexes();
    const vehicles = await findSavedVehiclesWithAlertsEnabled();

    const byUser = new Map<string, SavedVehicleDoc[]>();
    for (const vehicle of vehicles) {
      const list = byUser.get(vehicle.userId) ?? [];
      list.push(vehicle);
      byUser.set(vehicle.userId, list);
    }

    for (const [userId, userVehicles] of byUser) {
      let subscriptions;
      try {
        subscriptions = await findPushSubscriptionsByUser(userId);
      } catch {
        stats.errors += 1;
        continue;
      }
      stats.users += 1;

      for (const vehicle of userVehicles) {
        stats.vehiclesChecked += 1;

        let recalls: VehicleRecall[] = [];
        try {
          recalls = await getVehicleRecalls(
            vehicle.make,
            vehicle.model,
            vehicle.modelYear,
          );
        } catch {
          stats.errors += 1;
          continue;
        }
        if (recalls.length === 0) {
          continue;
        }

        let notified: Set<string>;
        try {
          notified = await findNotifiedCampaigns(userId, vehicle.vehicleKey);
        } catch {
          stats.errors += 1;
          continue;
        }

        const vehicleLabel = `${vehicle.modelYear} ${vehicle.make} ${vehicle.model}`;

        for (const recall of recalls) {
          if (notified.has(recall.campaignNumber)) {
            stats.duplicatesSkipped += 1;
            continue;
          }
          stats.newRecallsFound += 1;

          let sentCount = 0;
          for (const subscription of subscriptions) {
            try {
              await sendPushNotification(subscription.subscription, {
                title: `new recall: ${recall.component}`,
                body: `${vehicleLabel} · ${summarize(recall.summary)}`,
                url: `${origin}/vehicle/${encodeURIComponent(vehicle.make)}/${encodeURIComponent(vehicle.model)}/${vehicle.modelYear}/recalls/${recall.campaignNumber}`,
              });
              sentCount += 1;
            } catch (err) {
              if (err instanceof PushSubscriptionGoneError) {
                try {
                  await deletePushSubscriptionById(subscription._id);
                } catch {
                  stats.errors += 1;
                }
              } else {
                stats.errors += 1;
              }
            }
          }

          if (sentCount > 0) {
            stats.notificationsSent += sentCount;
            try {
              await recordAlertEvent(
                userId,
                vehicle.vehicleKey,
                recall.campaignNumber,
              );
            } catch {
              // event already recorded by a concurrent run; notification went out once
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true, ...stats });
  } catch {
    return NextResponse.json(
      { ok: false, error: "recall check failed." },
      { status: 500 },
    );
  }
}