import { Badge } from "@/src/components/ui/badge";
import { Container } from "@/src/components/ui/container";
import { VehicleSearch } from "@/src/components/search/vehicle-search";

export default function Home() {
  return (
    <Container className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col">
        <section className="flex flex-col items-center pb-24 pt-16 text-center sm:pt-24">
          <Badge variant="primary" className="mb-6">
            us vehicle safety & recall tracker
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            carrecallr
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
            know the recall history before you buy.
          </p>

          <div className="mt-10 w-full max-w-3xl">
            <VehicleSearch />
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            search by model year, make, and model · powered by nhtsa data
          </p>
        </section>
      </main>
    </Container>
  );
}