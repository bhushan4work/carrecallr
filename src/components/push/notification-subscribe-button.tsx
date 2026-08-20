"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";

type Status = "checking" | "unsupported" | "denied" | "ready" | "enabled";

const SW_URL = "/sw.js";

function supportsPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getRegistration(): Promise<ServiceWorkerRegistration> {
  if (navigator.serviceWorker.controller) {
    return navigator.serviceWorker.ready;
  }
  await navigator.serviceWorker.register(SW_URL);
  return navigator.serviceWorker.ready;
}

async function subscribeWithRetry(
  applicationServerKey: Uint8Array<ArrayBuffer>,
): Promise<PushSubscription> {
  const subscribe = async (
    registration: ServiceWorkerRegistration,
  ): Promise<PushSubscription> => {
    try {
      return await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        await registration.unregister().catch(() => false);
        const fresh = await navigator.serviceWorker.register(SW_URL);
        return fresh.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }
      throw err;
    }
  };
  return subscribe(await getRegistration());
}

export function NotificationSubscribeButton() {
  const [status, setStatus] = useState<Status>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!supportsPush()) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const registration = await getRegistration();
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          if (!cancelled) setStatus("ready");
          return;
        }
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        }).then((res) => {
          if (!res.ok) throw new Error("failed to sync subscription");
        });
        if (!cancelled) setStatus("enabled");
      } catch (err) {
        console.error("[push] sync existing subscription failed:", err);
        if (!cancelled) setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "ready");
        return;
      }
      const keyRes = await fetch("/api/push/public-key");
      if (!keyRes.ok) {
        setError("notifications aren't configured yet.");
        return;
      }
      const { publicKey } = await keyRes.json();
      const subscription = await subscribeWithRetry(
        urlBase64ToUint8Array(publicKey),
      );
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!res.ok) {
        setError("couldn't save the notification subscription.");
        return;
      }
      setStatus("enabled");
    } catch (err) {
      console.error("[push] enable failed:", err);
      if (err instanceof DOMException && err.name === "AbortError") {
        console.warn(
          "[push] the push service rejected the subscription. if you're using brave or a privacy blocker, disable shields/blocking for this site and try again.",
        );
      }
      setError(
        err instanceof Error
          ? `couldn't enable notifications: ${err.name}`
          : "couldn't enable notifications right now.",
      );
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const registration = await getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, {
          method: "DELETE",
        });
      }
      setStatus("ready");
    } catch (err) {
      console.error("[push] disable failed:", err);
      setError("couldn't disable notifications right now.");
    } finally {
      setBusy(false);
    }
  };

  if (status === "checking") {
    return null;
  }

  if (status === "unsupported") {
    return <p className="text-xs text-muted-foreground">browser notifications aren&apos;t supported here.</p>;
  }

  return (
    <div className="relative flex flex-col items-end">
      {status === "denied" ? (
        <p className="text-xs text-muted-foreground">
          notifications are blocked. enable them in your browser settings.
        </p>
      ) : status === "enabled" ? (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-success">notifications on</span>
          <Button type="button" variant="outline" size="sm" onClick={disable} disabled={busy}>
            {busy ? "disabling…" : "disable"}
          </Button>
        </div>
      ) : (
        <Button type="button" size="sm" onClick={enable} disabled={busy}>
          {busy ? "enabling…" : "enable browser notifications"}
        </Button>
      )}
      {error ? (
        <p
          className="absolute left-0 right-0 top-full mt-1 text-right text-xs leading-4 text-danger"
          aria-live="polite"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}