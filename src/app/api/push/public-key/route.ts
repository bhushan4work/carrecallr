import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY;
  if (!publicKey) {
    return NextResponse.json(
      { error: "notifications aren't configured yet." },
      { status: 500 },
    );
  }
  return NextResponse.json({ publicKey });
}