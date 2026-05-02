-- Run this against the production SQLite database to apply all missing schema changes.
-- Safe to run even if some changes were already applied (CREATE TABLE IF NOT EXISTS).
-- For ALTER TABLE columns: SQLite will error if the column already exists — ignore those errors.
--
-- Via SSH on Hostinger:
--   sqlite3 /path/to/your/database.db < apply-production-schema.sql
--
-- Or apply each statement individually in any SQLite GUI tool.

-- Add missing columns to Room (run each; ignore "duplicate column" errors if already present)
ALTER TABLE "Room" ADD COLUMN "address" TEXT;
ALTER TABLE "Room" ADD COLUMN "latitude" REAL;
ALTER TABLE "Room" ADD COLUMN "longitude" REAL;
ALTER TABLE "Room" ADD COLUMN "pricePerSlot" REAL NOT NULL DEFAULT 0;

-- UserRoom (many-to-many: users assigned to rooms)
CREATE TABLE IF NOT EXISTS "UserRoom" (
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY ("userId", "roomId")
);

-- Charge (booking charges)
CREATE TABLE IF NOT EXISTS "Charge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ISK',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Charge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Charge_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Charge_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Charge_bookingId_key" ON "Charge"("bookingId");

-- AccessRequest (users requesting access to rooms)
CREATE TABLE IF NOT EXISTS "AccessRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AccessRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AccessRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "AccessRequest_userId_roomId_key" ON "AccessRequest"("userId", "roomId");
