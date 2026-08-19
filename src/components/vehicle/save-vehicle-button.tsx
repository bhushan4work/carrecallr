"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export function SaveVehicleButton({
  make,
  model,
  modelYear,
  initialSaved = false,
}: {
  make: string;
  model: string;
  modelYear: number;
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/saved-vehicles")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { vehicles?: { vehicleKey: string }[] } | null) => {
        if (cancelled || !data?.vehicles) return;
        const key = `${make.toLowerCase()}:${model.toLowerCase()}:${modelYear}`;
        setSaved(data.vehicles.some((v) => v.vehicleKey === key));
      })
      .catch(() => {
        if (!cancelled) setError("couldn't load saved status.");
      });
    return () => {
      cancelled = true;
    };
  }, [make, model, modelYear]);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = saved
        ? await fetch(
            `/api/saved-vehicles?vehicleKey=${encodeURIComponent(
              `${make.toLowerCase()}:${model.toLowerCase()}:${modelYear}`,
            )}`,
            { method: "DELETE" },
          )
        : await fetch("/api/saved-vehicles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ make, model, modelYear }),
          });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "couldn't update the saved vehicle.");
        return;
      }
      setSaved((prev) => !prev);
    } catch {
      setError("couldn't update the saved vehicle right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={saved ? "outline" : "primary"}
        onClick={handleClick}
        disabled={busy}
      >
        {busy ? "saving…" : saved ? "saved" : "save vehicle"}
      </Button>
      {error ? (
        <p className={cn("text-xs text-danger")}>{error}</p>
      ) : null}
    </div>
  );
}