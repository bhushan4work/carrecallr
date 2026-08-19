import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Breadcrumb } from "@/src/components/ui/breadcrumb";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { Container } from "@/src/components/ui/container";
import { RemoveSavedVehicleButton } from "@/src/components/vehicle/remove-saved-vehicle-button";
import { requirePageUser } from "@/src/lib/auth";
import { findSavedVehicles } from "@/src/models/SavedVehicle";

function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function SavedVehiclesPage() {
  const userId = await requirePageUser();
  const user = await currentUser();

  let vehicles: Awaited<ReturnType<typeof findSavedVehicles>> = [];
  let loadError = false;
  try {
    vehicles = await findSavedVehicles(userId);
  } catch {
    loadError = true;
  }

  return (
    <Container className="flex flex-1 flex-col">
      <main className="flex-1 pb-24 pt-10 sm:pt-14">
        <Breadcrumb
          items={[
            { label: "search", href: "/" },
            { label: "saved" },
          ]}
        />

        <header className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              my vehicles
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              vehicles you&apos;re tracking. recall data is checked daily, and alerts are
              sent by email when a new recall is detected.
            </p>
          </div>
          <Link href="/" className="shrink-0">
            <Button variant="outline">add vehicle</Button>
          </Link>
        </header>

        <section className="mt-10">
          {loadError ? (
            <Card className="py-10 text-center">
              <p className="text-sm text-muted-foreground">
                couldn&apos;t load your saved vehicles right now. please try again
                later.
              </p>
            </Card>
          ) : vehicles.length === 0 ? (
            <Card className="py-16 text-center">
              <p className="text-base font-medium text-foreground">
                no saved vehicles yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                search for a vehicle and save it to track its recall history and
                get notified about new recalls.
              </p>
              <div className="mt-6 flex justify-center">
                <Link href="/">
                  <Button>search vehicles</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((v) => (
                <li key={v.vehicleKey}>
                  <Card className="flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/vehicle/${encodeURIComponent(v.make)}/${encodeURIComponent(
                          v.model,
                        )}/${v.modelYear}`}
                        className="min-w-0"
                      >
                        <p className="text-lg font-semibold tracking-tight text-foreground hover:underline">
                          {v.modelYear} {v.make} {v.model}
                        </p>
                      </Link>
                      <RemoveSavedVehicleButton vehicleKey={v.vehicleKey} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {v.alertsEnabled ? (
                        <Badge variant="success">alerts on</Badge>
                      ) : (
                        <Badge variant="neutral">alerts off</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        saved {formatDate(v.createdAt)}
                      </span>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 text-xs text-muted-foreground">
          alerts are sent to{" "}
          {user?.primaryEmailAddress?.emailAddress ?? "the email on your account"} when a new
          recall campaign is detected for a saved vehicle.
        </p>
      </main>
    </Container>
  );
}