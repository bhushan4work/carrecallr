import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/src/components/ui/badge";
import { Breadcrumb } from "@/src/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Container } from "@/src/components/ui/container";
import { SaveVehicleButton } from "@/src/components/vehicle/save-vehicle-button";
import { requirePageUser } from "@/src/lib/auth";
import { getSafetyRating } from "@/src/lib/nhtsa/ratings";
import { getVehicleRecalls } from "@/src/lib/nhtsa/recalls";

function formatCount(n: number | null): string {
  if (n === null) return "n/a";
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(0)}k`;
  }
  return String(n);
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string; model: string; year: string }>;
}): Promise<Metadata> {
  const { make, model, year } = await params;
  const noModel = model.toLowerCase() === "none";
  return { title: noModel ? `${year} ${make}` : `${year} ${make} ${model}` };
}

export default async function VehicleProfilePage({
  params,
}: {
  params: Promise<{ make: string; model: string; year: string }>;
}) {
  await requirePageUser();
  const { make, model, year } = await params;
  const modelYear = Number(year);
  const noModel = model.toLowerCase() === "none";
  const vehicleName = noModel ? `${year} ${make}` : `${year} ${make} ${model}`;

  const [recalls, rating] = await Promise.all([
    getVehicleRecalls(make, model, modelYear).catch(() => null),
    getSafetyRating(make, model, modelYear).catch(() => null),
  ]);

  const loaded = recalls !== null;
  const data = recalls ?? [];

  const totalRecalls = data.length;
  const affectedCounts = data
    .map((r) => r.affected)
    .filter((n): n is number => n !== null);
  const affectedVehicles = affectedCounts.reduce((sum, n) => sum + n, 0);
  const hasAffected = affectedCounts.length > 0;
  const latestRecall = data[0];

  const yearly = Array.from(
    data.reduce<Map<number, number>>((acc, r) => {
      if (Number.isFinite(r.year)) {
        acc.set(r.year, (acc.get(r.year) ?? 0) + 1);
      }
      return acc;
    }, new Map()),
  ).map(([y, count]) => ({ year: y, count }));

  const maxYearCount = yearly.length
    ? Math.max(...yearly.map((y) => y.count))
    : 0;

  const componentBreakdown = Array.from(
    data.reduce<Map<string, number>>((acc, r) => {
      acc.set(r.component, (acc.get(r.component) ?? 0) + 1);
      return acc;
    }, new Map()),
  ).map(([name, count]) => ({ name, count }));

  const maxComponentCount = componentBreakdown.length
    ? Math.max(...componentBreakdown.map((c) => c.count))
    : 0;

  return (
    <Container className="flex flex-1 flex-col">
      <main className="flex-1 pb-24 pt-10 sm:pt-14">
        <Breadcrumb
          items={
            noModel
              ? [
                  { label: "search", href: "/" },
                  { label: make },
                  { label: year },
                ]
              : [
                  { label: "search", href: "/" },
                  { label: make },
                  { label: model },
                  { label: year },
                ]
          }
        />

        <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {vehicleName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={totalRecalls > 0 ? "danger" : "success"}>
                {totalRecalls} recalls
              </Badge>
              <Badge variant="neutral">
                safety rating {rating ? `${rating}/5` : "n/a"}
              </Badge>
              <Badge variant="neutral">source: nhtsa</Badge>
            </div>
          </div>
          <div className="shrink-0">
            {noModel ? null : (
              <SaveVehicleButton make={make} model={model} modelYear={modelYear} />
            )}
          </div>
        </header>

        {!loaded ? (
          <Card className="mt-10 max-w-3xl">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">
                couldn&apos;t retrieve vehicle data right now. please try again
                later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <Stat label="total recalls" value={String(totalRecalls)} />
              <Stat label="safety rating" value={rating ? `${rating}/5` : "n/a"} sub="overall nhtsa rating" />
              <Stat
                label="affected vehicles"
                value={hasAffected ? formatCount(affectedVehicles) : "n/a"}
              />
              <Stat
                label="latest recall"
                value={latestRecall ? String(latestRecall.year) : "none"}
                sub={latestRecall?.component}
              />
              <Stat label="data source" value="nhtsa" sub="official nhtsa data" />
            </section>

            <section className="mt-14">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-lg font-semibold tracking-tight">recall history</h2>
                <span className="text-xs text-muted-foreground">source: nhtsa</span>
              </div>
              <Card className="mt-4">
                {data.length ? (
                  <ul className="divide-y divide-border">
                    {data.map((r) => (
                      <li key={r.campaignNumber}>
                        <Link
                          href={`/vehicle/${make}/${model}/${year}/recalls/${r.campaignNumber}`}
                          className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-foreground">
                                {r.year} · {r.component}
                              </p>
                              <Badge variant="neutral">{r.campaignNumber}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>
                          </div>
                          <p className="shrink-0 text-sm text-muted-foreground sm:pt-1">
                            {formatCount(r.affected)} affected
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <CardContent className="py-8">
                    <p className="text-sm text-muted-foreground">
                      {noModel
                        ? "nhtsa records recalls by specific model, and no model is listed for this make & year, so no recall records are available."
                        : "no recalls recorded for this vehicle."}
                    </p>
                  </CardContent>
                )}
              </Card>
            </section>

            <section className="mt-14 grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>recall timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.length ? (
                    <ul className="space-y-5">
                      {data.map((r) => (
                        <li key={r.campaignNumber} className="flex gap-3">
                          <span
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {r.date} · {r.component}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {r.campaignNumber}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      no recalls to show.
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>recalls by year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {yearly.length ? (
                      <div className="flex h-40 gap-3">
                        {yearly.map((y) => (
                          <div
                            key={y.year}
                            className="flex flex-1 flex-col items-center gap-2"
                          >
                            <span className="text-xs font-medium text-muted-foreground">
                              {y.count}
                            </span>
                            <div className="flex w-full flex-1 items-end">
                              <div
                                className="w-full max-w-12 rounded-t bg-primary"
                                style={{
                                  height: `${Math.max((y.count / maxYearCount) * 100, 8)}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{y.year}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">no data.</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>component distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {componentBreakdown.length ? (
                      <div className="space-y-3">
                        {componentBreakdown.map((c) => (
                          <div key={c.name}>
                            <div className="flex items-center justify-between gap-2 text-sm">
                              <span className="text-foreground">{c.name}</span>
                              <span className="text-xs text-muted-foreground">{c.count}</span>
                            </div>
                            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${(c.count / maxComponentCount) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">no data.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </main>
    </Container>
  );
}