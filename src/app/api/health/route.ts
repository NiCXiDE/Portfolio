import { NextResponse } from "next/server";

/** Liveness/readiness sin tocar MySQL — el probe no debe depender del seed/V2. */
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
