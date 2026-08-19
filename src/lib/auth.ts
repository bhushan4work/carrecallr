import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export class UnauthorizedError extends Error {
  constructor() {
    super("unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

export async function requirePageUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect("/signup");
  }
  return userId;
}