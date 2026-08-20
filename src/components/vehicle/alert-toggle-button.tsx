"use client";

import { useState } from "react";
import { Toggle } from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";

export function AlertToggleButton({
  vehicleKey,
  initialEnabled,
}: {
  vehicleKey: string;
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleKey, alertsEnabled: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "couldn't update alert settings.");
        return;
      }
      setEnabled(next);
    } catch {
      setError("couldn't update alert settings right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">alerts</span>
        <Toggle
          checked={enabled}
          onCheckedChange={handleChange}
          disabled={busy}
          aria-label="Toggle recall alerts"
        />
      </div>
      {error ? (
        <p className={cn("text-xs text-danger")}>{error}</p>
      ) : null}
    </div>
  );
}