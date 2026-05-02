import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export function GET() {
  return NextResponse.json({ version: process.env.APP_VERSION ?? "1.0.0" })
}
