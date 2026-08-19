import { cached } from "@/src/lib/cache";
import { nhtsaFetch } from "./client";
import type { VpicMakesResponse, VpicModelsResponse } from "./types";

const VPIC_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles";

export async function getMakes(): Promise<string[]> {
  return cached("vpic:makes", async () => {
    const data = await nhtsaFetch<VpicMakesResponse>(
      `${VPIC_BASE}/GetMakesForVehicleType/car?format=json`,
    );
    return [...new Set(data.Results.map((r) => r.MakeName))].sort();
  });
}

export async function getModels(make: string, year: number): Promise<string[]> {
  const key = `vpic:models:${make.toLowerCase()}:${year}`;
  return cached(key, async () => {
    const url = `${VPIC_BASE}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${year}?format=json`;
    const data = await nhtsaFetch<VpicModelsResponse>(url);
    return [...new Set(data.Results.map((r) => r.Model_Name))].sort();
  });
}