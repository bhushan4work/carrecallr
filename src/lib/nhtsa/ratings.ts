import { cached } from "@/src/lib/cache";
import { nhtsaFetch } from "./client";
import type {
  SafetyRatingsDetailResponse,
  SafetyRatingsLookupResponse,
} from "./types";

export async function getSafetyRating(
  make: string,
  model: string,
  year: number,
): Promise<number | null> {
  const key = `rating:${make.toLowerCase()}:${model.toLowerCase()}:${year}`;
  return cached(key, async () => {
    const lookupUrl = `https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}?format=json`;
    const lookup = await nhtsaFetch<SafetyRatingsLookupResponse>(lookupUrl);
    const vehicleId = lookup.Results?.[0]?.VehicleId;
    if (!vehicleId) {
      return null;
    }

    const detail = await nhtsaFetch<SafetyRatingsDetailResponse>(
      `https://api.nhtsa.gov/SafetyRatings/VehicleId/${vehicleId}?format=json`,
    );
    const rating = Number(detail.Results?.[0]?.OverallRating);
    return Number.isFinite(rating) ? rating : null;
  });
}