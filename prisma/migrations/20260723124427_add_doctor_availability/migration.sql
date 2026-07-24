-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateTable
CREATE TABLE "RecurringAvailability" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RecurringAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomAvailability" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CustomAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringAvailability_userId_idx" ON "RecurringAvailability"("userId");

-- CreateIndex
CREATE INDEX "CustomAvailability_userId_idx" ON "CustomAvailability"("userId");

-- AddForeignKey
ALTER TABLE "RecurringAvailability" ADD CONSTRAINT "RecurringAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomAvailability" ADD CONSTRAINT "CustomAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
