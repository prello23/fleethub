import { NextResponse } from "next/server"
import fs from "fs"

export const dynamic = "force-dynamic"

export function GET() {
  const dbUrl = process.env.DATABASE_URL ?? ""
  const dbPath = dbUrl.replace("file:", "")
  const dbExists = dbPath ? fs.existsSync(dbPath) : false

  return NextResponse.json({
    status: "ok",
    nodeVersion: process.version,
    dbUrl,
    dbPath,
    dbExists,
    time: new Date().toISOString(),
  })
}
