import { PrismaClient } from "../generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { db } from "./db"

// Reuse the shared db singleton so we have exactly ONE SQLite connection
const g = globalThis as unknown as { prisma: PrismaClient | undefined }
if (!g.prisma) {
  const adapter = new PrismaBetterSqlite3(db)
  g.prisma = new PrismaClient({ adapter } as never)
  console.log("[prisma] client initialized (shared db connection)")
}
export const prisma = g.prisma!
