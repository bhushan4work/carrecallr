import Image from "next/image";
import Link from "next/link";

interface AuthShellProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

/* ------------------------------------------------------------------ */
/*  SVG icon helpers – inlined to avoid extra dependencies             */
/* ------------------------------------------------------------------ */

function ShieldLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L3 7v5c0 5.25 3.83 10.17 9 11.38C17.17 22.17 21 17.25 21 12V7l-9-5z"
        fill="#2563eb"
      />
      <path
        d="M10 15.17l-3.59-3.58L5 13l5 5 9-9-1.41-1.42L10 15.17z"
        fill="#fff"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      className="h-5 w-5 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg
      className="h-5 w-5 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10H8s-2.7.6-4.5 1.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
      <path d="M5.7 11L7 7h10l1.3 4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      className="h-5 w-5 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 9l-5 5-2-2-4 4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AuthShell({ children, title, description }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background lg:flex-row">
      {/* ============  LEFT PANEL  ============ */}
      <div className="relative hidden h-screen w-full flex-col overflow-hidden lg:flex lg:w-[50%]"
        style={{
          background:
            "linear-gradient(165deg, #eef3ff 0%, #f5f7ff 40%, #edf1fc 100%)",
        }}
      >
        {/* Top-left brand */}
        <div className="relative z-10 shrink-0 px-10 pt-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <ShieldLogo className="h-7 w-7" />
            <span className="text-lg font-bold tracking-tight text-foreground">
              RecallWatch
            </span>
          </Link>
        </div>

        {/* Centre copy */}
        <div className="relative z-10 min-h-0 flex-1 px-10 pt-8 pb-0 xl:px-14">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
            <ShieldLogo className="h-4 w-4" />
            Stay safe. Stay informed.
          </span>

          {/* Heading */}
          <h1 className="mt-5 text-[2.25rem] font-extrabold leading-[1.15] tracking-tight text-foreground xl:text-[2.5rem]">
            Because every
            <br />
            <span className="text-primary">recall</span> matters.
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-sm text-[0.9rem] leading-relaxed text-muted-foreground">
            RecallWatch helps you track recalls, monitor your vehicles, and get
            alerts that keep you and your loved ones safe on the road.
          </p>

          {/* Feature list */}
          <ul className="mt-6 space-y-3">
            <li className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                <BellIcon />
              </span>
              <span className="text-sm font-medium text-foreground">
                Real-time recall alerts
              </span>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <CarIcon />
              </span>
              <span className="text-sm font-medium text-foreground">
                Save &amp; monitor your vehicles
              </span>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                <ChartIcon />
              </span>
              <span className="text-sm font-medium text-foreground">
                Insights you can trust
              </span>
            </li>
          </ul>
        </div>

        {/* Bottom car image – flex-shrink allows it to compress when viewport is tight */}
        <div className="relative z-0 mt-auto h-[280px] w-full shrink xl:h-[320px] mb-12" style={{ minHeight: '180px' }}>
          <Image
            src="/signup.png"
            alt="Car with safety shield"
            fill
            priority
            sizes="52vw"
            className="object-contain object-bottom"
          />
        </div>
      </div>

      {/* ============  RIGHT PANEL  ============ */}
      <div className="flex min-h-screen min-w-0 w-full flex-col lg:min-h-0 lg:w-[50%]">
        {/* Mobile brand */}
        <div className="flex items-center gap-2 px-6 pt-8 lg:hidden">
          <ShieldLogo className="h-6 w-6" />
          <span className="text-base font-bold tracking-tight text-foreground">
            carrecallr
          </span>
        </div>

        {/* Sign-in content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:py-16">
          <div className="w-full max-w-md">
            {/* Heading */}
            <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            ) : null}

            {/* Clerk widget */}
            <div className="mt-8">{children}</div>
          </div>
        </div>

        {/* Bottom legal line */}
        <div className="px-6 pb-8 text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-primary hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}