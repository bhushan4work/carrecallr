export type VpicMakesResponse = {
  Count: number;
  Message: string;
  Results: { MakeName: string }[];
};

export type VpicModelsResponse = {
  Count: number;
  Message: string;
  Results: { Model_Name: string }[];
};

export type RawRecall = {
  Manufacturer: string;
  NHTSACampaignNumber: string;
  ReportReceivedDate: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  Notes: string;
  ModelYear: string;
  Make: string;
  Model: string;
};

export type RecallsResponse = {
  Count: number;
  Message: string;
  results: RawRecall[];
};

export type SafetyRatingsLookupResponse = {
  Count: number;
  Message: string;
  Results: { VehicleId: number }[];
};

export type SafetyRatingsDetailResponse = {
  Count: number;
  Message: string;
  Results: { OverallRating: string }[];
};