import Link from "next/link";
import { cn } from "@/src/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center text-sm", className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={item.label} className="flex items-center">
            {i > 0 ? (
              <span className="mx-2 text-muted" aria-hidden="true">
                /
              </span>
            ) : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "text-foreground" : "text-muted-foreground"}
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}