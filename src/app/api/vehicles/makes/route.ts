import { NextResponse } from "next/server";
import { getMakes } from "@/src/lib/nhtsa/vpic";

export async function GET() {
  try {
    const makes = await getMakes();
    return NextResponse.json({ makes });
  } catch {
    return NextResponse.json(
      { error: "couldn't load vehicle makes right now. please try again later." },
      { status: 502 },
    );
  }
}