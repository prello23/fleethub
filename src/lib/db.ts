import Database from "better-sqlite3"

const url = process.env.DATABASE_URL ?? "file:./dev.db"
const dbPath = url.startsWith("file:") ? url.slice(5) : url

// Singleton: ONE connection shared across all server code (zero extra threads)
const g = globalThis as unknown as { _laundryDb: InstanceType<typeof Database> | undefined }
if (!g._laundryDb) {
  g._laundryDb = new Database(dbPath)
  g._laundryDb.pragma("journal_mode = WAL")
  g._laundryDb.pragma("foreign_keys = ON")
  console.log("[db] SQLite connection opened:", dbPath, "node:", process.version)
}
export const db = g._laundryDb!
