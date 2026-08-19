import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { Container } from "@/src/components/ui/container";

export default function SavedVehiclesLoading() {
  return (
    <Container className="flex flex-1 flex-col">
      <main className="flex-1 pb-24 pt-10 sm:pt-14">
        <div className="h-4 w-24 rounded bg-surface-subtle" />
        <div className="mt-6 h-8 w-48 rounded bg-surface-subtle" />
        <div className="mt-3 h-4 w-80 max-w-full rounded bg-surface-subtle" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="h-5 w-40 rounded bg-surface-subtle" />
                  <div className="h-5 w-16 rounded-full bg-surface-subtle" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-4 w-32 rounded bg-surface-subtle" />
                <div className="mt-4 h-4 w-20 rounded bg-surface-subtle" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </Container>
  );
}