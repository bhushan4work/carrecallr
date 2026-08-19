"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";

export function RemoveSavedVehicleButton({ vehicleKey }: { vehicleKey: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(
        `/api/saved-vehicles?vehicleKey=${encodeURIComponent(vehicleKey)}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={busy}
    >
      {busy ? "removing…" : "remove"}
    </Button>
  );
}