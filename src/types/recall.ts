export type VehicleRecall = {
  campaignNumber: string;
  date: string;
  year: number;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  affected: number | null;
  manufacturer: string;
  sourceUrl: string;
};