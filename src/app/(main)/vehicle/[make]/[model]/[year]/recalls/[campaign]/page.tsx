import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/src/components/ui/badge";
import { Breadcrumb } from "@/src/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Container } from "@/src/components/ui/container";
import { requirePageUser } from "@/src/lib/auth";
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

function MetaStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-lg font-semibold tracking-tight text-foreground">
          {value}
        </p>
        {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
      </CardContent>
    </Card>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ make: string; model: string; year: string; campaign: string }>;
}): Promise<Metadata> {
  const { make, model, year, campaign } = await params;
  const recalls = await getVehicleRecalls(make, model, Number(year)).catch(
    () => [],
  );
  const recall = recalls.find(
    (r) => r.campaignNumber.toLowerCase() === campaign.toLowerCase(),
  );
  return { title: recall ? `${recall.component} recall` : "recall" };
}

export default async function RecallDetailPage({
  params,
}: {
  params: Promise<{ make: string; model: string; year: string; campaign: string }>;
}) {
  await requirePageUser();
  const { make, model, year, campaign } = await params;

  const recalls = await getVehicleRecalls(make, model, Number(year)).catch(() => []);
  const recall = recalls.find(
    (r) => r.campaignNumber.toLowerCase() === campaign.toLowerCase(),
  );
  if (!recall) {
    notFound();
  }

  const vehicleLabel = `${year} ${make} ${model}`;
  const vehicleUrl = `/vehicle/${make}/${model}/${year}`;

  return (
    <Container className="flex flex-1 flex-col">
      <main className="flex-1 pb-24 pt-10 sm:pt-14">
        <Breadcrumb
          items={[
            { label: "search", href: "/" },
            { label: vehicleLabel, href: vehicleUrl },
            { label: recall.campaignNumber },
          ]}
        />

        <header className="mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="danger">recall</Badge>
            <Badge variant="neutral">{recall.campaignNumber}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {recall.component} recall
          </h1>
          <p className="mt-2 text-muted-foreground">
            {vehicleLabel} · issued {recall.date}
          </p>
        </header>

        <section className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetaStat label="campaign number" value={recall.campaignNumber} />
          <MetaStat label="recall date" value={recall.date} />
          <MetaStat
            label="affected vehicles"
            value={formatCount(recall.affected)}
            sub="when reported by manufacturer"
          />
          <MetaStat label="manufacturer" value={recall.manufacturer} />
        </section>

        <section className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>recall details</CardTitle>
            </CardHeader>
            <dl className="divide-y divide-border">
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-muted-foreground">component</dt>
                <dd className="text-sm text-foreground">{recall.component}</dd>
              </div>
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-muted-foreground">summary</dt>
                <dd className="text-sm leading-relaxed text-foreground">{recall.summary}</dd>
              </div>
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-muted-foreground">consequence</dt>
                <dd className="text-sm leading-relaxed text-foreground">
                  {recall.consequence}
                </dd>
              </div>
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-muted-foreground">remedy</dt>
                <dd className="text-sm leading-relaxed text-foreground">{recall.remedy}</dd>
              </div>
              <div className="grid gap-1 px-5 py-4 sm:grid-cols-[180px_1fr] sm:gap-6">
                <dt className="text-sm font-medium text-muted-foreground">
                  source / reference
                </dt>
                <dd className="text-sm text-foreground">
                  <a
                    href={recall.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    view on nhtsa.gov
                  </a>
                </dd>
              </div>
            </dl>
          </Card>
        </section>
      </main>
    </Container>
  );
}