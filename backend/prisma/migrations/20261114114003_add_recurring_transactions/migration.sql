-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CONFIRMED', 'PENDING');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "RecurringMode" AS ENUM ('AUTO', 'CONFIRM');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "recurringTransactionId" UUID,
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'CONFIRMED';

-- CreateTable
CREATE TABLE "RecurringTransaction" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "monthOfYear" INTEGER,
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "mode" "RecurringMode" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastGeneratedAt" DATE,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringTransaction_userId_idx" ON "RecurringTransaction"("userId");

-- CreateIndex
CREATE INDEX "RecurringTransaction_categoryId_idx" ON "RecurringTransaction"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_recurringTransactionId_date_key" ON "Transaction"("recurringTransactionId", "date");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringTransactionId_fkey" FOREIGN KEY ("recurringTransactionId") REFERENCES "RecurringTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

