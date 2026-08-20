import { NextResponse } from "next/server";
import { getModels } from "@/src/lib/nhtsa/vpic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make");
  const year = Number(searchParams.get("year"));

  if (
    !make ||
    make.length > 100 ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > 2100
  ) {
    return NextResponse.json(
      { error: "invalid vehicle parameters." },
      { status: 400 },
    );
  }

  try {
    const models = await getModels(make, year);
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json(
      { error: "couldn't load vehicle models right now. please try again later." },
      { status: 502 },
    );
  }
}