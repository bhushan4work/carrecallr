import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Container } from "@/src/components/ui/container";

const navLinks = [
  { href: "/", label: "search" },
  { href: "/saved", label: "saved" },
];

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <Container className="flex min-h-14 flex-wrap items-center justify-between gap-x-2 gap-y-1 py-2 sm:py-0">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            carrecallr
          </Link>

          <nav className="flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-foreground sm:px-2.5"
              >
                {link.label}
              </Link>
            ))}
            <Show when="signed-in">
              <Link
                href="/account"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-subtle hover:text-foreground sm:px-2.5"
              >
                account
              </Link>
            </Show>
            <Show when="signed-out">
              <Link
                href="/signup"
                className="rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-hover sm:px-2.5"
              >
                sign in
              </Link>
            </Show>
          </nav>
        </Container>
      </header>

      {children}

      <footer className="border-t border-border">
        <Container>
          <p className="py-5 text-center text-sm text-muted-foreground">
            built by ·{" "}
            <a
              href="https://x.com/PLACEHOLDER"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow on X (Twitter)"
              className="transition-colors hover:text-foreground"
            >
              twitter
            </a>{" "}
            ·{" "}
            <a
              href="https://linkedin.com/in/PLACEHOLDER"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on LinkedIn"
              className="transition-colors hover:text-foreground"
            >
              linkedin
            </a>
          </p>
        </Container>
      </footer>
    </>
  );
}