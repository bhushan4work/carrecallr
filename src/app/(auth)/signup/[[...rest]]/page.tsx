import type { Metadata } from "next";
import { AuthShell } from "@/src/components/auth/auth-shell";
import { GoogleSignInButton } from "@/src/components/auth/google-sign-in-button";

export const metadata: Metadata = {
  title: "sign in",
  description:
    "sign in or create your carrecallr account to save vehicles and get recall alerts.",
};

export default function AuthPage() {
  return (
    <AuthShell
      title="Welcome to carrecallr"
      description="Sign in or create an account to save vehicles and get recall alerts."
    >
      <GoogleSignInButton />
    </AuthShell>
  );
}