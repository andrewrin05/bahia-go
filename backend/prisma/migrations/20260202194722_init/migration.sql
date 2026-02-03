-- AlterTable
ALTER TABLE "Boat" ADD COLUMN "latitude" REAL;
ALTER TABLE "Boat" ADD COLUMN "longitude" REAL;
ALTER TABLE "Boat" ADD COLUMN "neighborhood" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalPrice" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "paymentProvider" TEXT DEFAULT 'none',
    "paymentReference" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentCheckoutUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "Boat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("boatId", "createdAt", "endDate", "id", "startDate", "status", "totalPrice", "updatedAt", "userId") SELECT "boatId", "createdAt", "endDate", "id", "startDate", "status", "totalPrice", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
