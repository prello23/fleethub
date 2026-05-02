import { PrismaClient } from "../generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import Database from "better-sqlite3"

function createPrismaClient() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db"
  // Convert file: URL to actual path
  const dbPath = url.startsWith("file:") ? url.slice(5) : url
  console.log("[Prisma] init. node:", process.version, "path:", dbPath)
  try {
    const db = new Database(dbPath)
    const adapter = new PrismaBetterSqlite3(db)
    return new PrismaClient({ adapter } as never)
  } catch (err) {
    console.error("[Prisma] FAILED:", err)
    throw err
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
