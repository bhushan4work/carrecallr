import webpush from "web-push";

let configured = false;

function ensureConfigured(): void {
  if (configured) {
    return;
  }
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error("web push is not configured (WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_SUBJECT).");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export class PushSubscriptionGoneError extends Error {
  constructor() {
    super("push subscription is no longer valid");
    this.name = "PushSubscriptionGoneError";
  }
}

export type PushPayload = {
  title: string;
  body: string;
  url: string;
};

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: PushPayload,
): Promise<void> {
  ensureConfigured();
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    if (err instanceof webpush.WebPushError) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        throw new PushSubscriptionGoneError();
      }
    }
    throw err;
  }
}