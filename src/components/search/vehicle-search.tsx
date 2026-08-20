"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/src/components/ui/button";
import { Select } from "@/src/components/ui/select";

const YEARS_BACK = 40;

export function VehicleSearch() {
  const router = useRouter();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [modelsKey, setModelsKey] = useState<string>("");
  const [modelsError, setModelsError] = useState(false);
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [loadingMakes, setLoadingMakes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: YEARS_BACK }, (_, i) => current - i);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/vehicles/makes")
      .then((res) => res.json())
      .then((data: { makes?: string[]; error?: string }) => {
        if (cancelled) return;
        if (data.makes) {
          setMakes(data.makes);
        } else {
          setError(data.error ?? "couldn't load vehicle makes.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("couldn't load vehicle makes.");
      })
      .finally(() => {
        if (!cancelled) setLoadingMakes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!year || !make) return;
    const key = `${year}|${make}`;
    let cancelled = false;
    fetch(`/api/vehicles/models?make=${encodeURIComponent(make)}&year=${year}`)
      .then((res) => res.json())
      .then((data: { models?: string[]; error?: string }) => {
        if (cancelled) return;
        setModels(data.models ?? []);
        setModelsKey(key);
        if (data.error) {
          setModelsError(true);
          setError(data.error);
        } else {
          setModelsError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModels([]);
          setModelsKey(key);
          setModelsError(true);
          setError("couldn't load vehicle models.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [year, make]);

  const loadingModels = Boolean(year && make) && modelsKey !== `${year}|${make}`;

  const noModels =
    Boolean(year && make) &&
    !loadingModels &&
    !modelsError &&
    models.length === 0;

  const handleYearChange = (value: string) => {
    setYear(value);
    setModel("");
    setModelsError(false);
  };

  const handleMakeChange = (value: string) => {
    setMake(value);
    setModel("");
    setModelsError(false);
  };

  const ready = Boolean(year && make && model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || !authLoaded) return;
    if (!isSignedIn) {
      router.push("/signup");
      return;
    }
    router.push(
      `/vehicle/${encodeURIComponent(make)}/${encodeURIComponent(model)}/${year}`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          value={year}
          onChange={(e) => handleYearChange(e.target.value)}
          aria-label="Model year"
          className="sm:w-32"
        >
          <option value="">year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </Select>

        <Select
          value={make}
          onChange={(e) => handleMakeChange(e.target.value)}
          aria-label="Vehicle make"
          disabled={loadingMakes || makes.length === 0}
          className="flex-1"
        >
          <option value="">
            {loadingMakes ? "loading makes…" : "make"}
          </option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            aria-label="Vehicle model"
            disabled={!year || !make || loadingModels || models.length === 0}
          >
            <option value="">
              {loadingModels
                ? "loading models…"
                : !make
                  ? "model"
                  : models.length === 0
                    ? "no models found"
                    : "model"}
            </option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          {noModels ? (
            <p className="text-xs text-muted-foreground">
              no model for this make &amp; year
            </p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="h-12 shrink-0" disabled={!authLoaded || !ready}>
          search
        </Button>
      </div>

      {error ? (
        <p className="mt-3 text-center text-sm text-danger sm:text-left">{error}</p>
      ) : null}
    </form>
  );
}