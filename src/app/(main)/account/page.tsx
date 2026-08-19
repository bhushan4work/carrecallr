"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { Breadcrumb } from "@/src/components/ui/breadcrumb";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Container } from "@/src/components/ui/container";
import { Input } from "@/src/components/ui/input";
import { Toggle } from "@/src/components/ui/toggle";

export default function AccountPage() {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteAccount = async () => {
    if (!confirm("This permanently deletes your account. Are you sure?")) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await user?.delete();
      router.push("/");
    } catch {
      setError("couldn't delete account. please try again later.");
      setDeleting(false);
    }
  };

  const accountEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <Container className="flex flex-1 flex-col">
      <main className="flex-1 pb-24 pt-10 sm:pt-14">
        <Breadcrumb
          items={[
            { href: "/", label: "search" },
            { label: "account" },
          ]}
        />

        <header className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            account
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            manage your email preferences and recall alerts for saved vehicles.
          </p>
        </header>

        {!userLoaded ? (
          <p className="mt-10 text-sm text-muted-foreground">loading…</p>
        ) : !isSignedIn ? (
          <Card className="mt-10 max-w-3xl">
            <CardHeader>
              <CardTitle>account required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                create an account to save vehicles and manage recall alerts.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button>sign in</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">create account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-10 max-w-3xl space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>email preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={accountEmail}
                    readOnly
                    className="mt-1.5 max-w-md"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    recall alerts are sent to this email address.
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-5">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        recall alerts
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        email me when a new recall is detected for one of my saved
                        vehicles.
                      </p>
                    </div>
                    <Toggle
                      checked={alertsEnabled}
                      onCheckedChange={setAlertsEnabled}
                      aria-label="Toggle recall alerts"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>account</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="outline" onClick={() => signOut()}>
                    sign out
                  </Button>
                  <Button variant="danger" onClick={deleteAccount} disabled={deleting}>
                    {deleting ? "deleting…" : "delete account"}
                  </Button>
                </CardContent>
                {error ? (
                  <p className="px-5 pb-5 text-sm text-danger">{error}</p>
                ) : null}
              </Card>
            </div>

            <p className="mt-8 max-w-3xl text-xs text-muted-foreground">
              signed in as {accountEmail}. saved vehicles, alerts, and email
              delivery are not wired up yet.
            </p>
          </>
        )}
      </main>
    </Container>
  );
}