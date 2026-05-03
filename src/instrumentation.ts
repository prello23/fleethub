export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION:", err)
      console.error(err.stack)
    })
    process.on("unhandledRejection", (reason, promise) => {
      console.error("UNHANDLED REJECTION at:", promise, "reason:", reason)
    })

    // Runtime migration: add new User columns using better-sqlite3 directly.
    // $executeRawUnsafe is NOT supported with Prisma driver adapters — use DB directly.
    try {
      const Database = (await import("better-sqlite3")).default
      const url = process.env.DATABASE_URL ?? "file:./dev.db"
      const dbPath = url.startsWith("file:") ? url.slice(5) : url
      const db = new Database(dbPath)

      const columns = db.pragma("table_info(User)") as Array<{ name: string }>
      const colNames = columns.map((c) => c.name)

      if (!colNames.includes("oneSignalPlayerId")) {
        db.exec(`ALTER TABLE "User" ADD COLUMN "oneSignalPlayerId" TEXT`)
        console.log("[migration] Added oneSignalPlayerId column")
      }
      if (!colNames.includes("notifyPush")) {
        db.exec(`ALTER TABLE "User" ADD COLUMN "notifyPush" INTEGER NOT NULL DEFAULT 1`)
        console.log("[migration] Added notifyPush column")
      }
      if (!colNames.includes("notifyEmail")) {
        db.exec(`ALTER TABLE "User" ADD COLUMN "notifyEmail" INTEGER NOT NULL DEFAULT 1`)
        console.log("[migration] Added notifyEmail column")
      }
      if (!colNames.includes("pushSubscription")) {
        db.exec(`ALTER TABLE "User" ADD COLUMN "pushSubscription" TEXT`)
        console.log("[migration] Added pushSubscription column")
      }

      db.close()
      console.log("[migration] User columns ensured ✓")
    } catch (err) {
      console.error("[migration] Startup migration failed:", err)
    }
  }
}
