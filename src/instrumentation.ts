export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION:", err)
      console.error(err.stack)
    })
    process.on("unhandledRejection", (reason, promise) => {
      console.error("UNHANDLED REJECTION at:", promise, "reason:", reason)
    })

    // Runtime migration: add new User columns if they don't exist yet.
    // SQLite throws "duplicate column name" when the column is already
    // present — the inner catch() silences that expected error.
    try {
      const { prisma } = await import("@/lib/prisma")
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "User" ADD COLUMN "oneSignalPlayerId" TEXT`
      ).catch(() => {})
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "User" ADD COLUMN "notifyPush" INTEGER NOT NULL DEFAULT 1`
      ).catch(() => {})
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "User" ADD COLUMN "notifyEmail" INTEGER NOT NULL DEFAULT 1`
      ).catch(() => {})
      console.log("[migration] User columns ensured")
    } catch (err) {
      console.error("[migration] Startup migration failed:", err)
    }
  }
}
