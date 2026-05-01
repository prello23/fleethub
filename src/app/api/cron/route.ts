import { NextResponse } from "next/server"
import { processNotifications } from "@/lib/notifications"

// This endpoint can be called by an external cron service as a fallback.
// The server also runs a node-cron job via instrumentation.ts.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await processNotifications()
  return NextResponse.json({ ok: true })
}
