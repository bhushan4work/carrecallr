import { cached } from "@/src/lib/cache";
import { nhtsaFetch } from "./client";
import type { RecallsResponse } from "./types";
import type { VehicleRecall } from "@/src/types/recall";

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function parseReportDate(value: string): { year: number; date: string } {
  const [day, month, year] = value.split("/").map(Number);
  if (!day || !month || !year) {
    return { year: NaN, date: value };
  }
  const monthName = MONTHS[month - 1] ?? String(month);
  return { year, date: `${monthName} ${day}, ${year}` };
}

function toAffected(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function getVehicleRecalls(
  make: string,
  model: string,
  year: number,
): Promise<VehicleRecall[]> {
  const key = `recalls:${make.toLowerCase()}:${model.toLowerCase()}:${year}`;
  return cached(key, async () => {
    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
    const data = await nhtsaFetch<RecallsResponse>(url);
    const results = Array.isArray(data.results) ? data.results : [];
    return results.map((r) => {
      const { year: recallYear, date } = parseReportDate(r.ReportReceivedDate);
      return {
        campaignNumber: r.NHTSACampaignNumber,
        date,
        year: recallYear,
        component: r.Component,
        summary: r.Summary,
        consequence: r.Consequence,
        remedy: r.Remedy,
        affected: toAffected(r.PotentialNumberOfUnitsAffected),
        manufacturer: r.Manufacturer,
        sourceUrl: `https://www.nhtsa.gov/recalls?nhtsaId=${r.NHTSACampaignNumber}`,
      };
    });
  });
}