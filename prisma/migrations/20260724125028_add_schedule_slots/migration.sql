/*
  Warnings:

  - You are about to drop the column `appointmentEnd` on the `Appointment` table. All the data in the column will be lost.
  - You are about to drop the column `appointmentStart` on the `Appointment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slotId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "appointmentEnd",
DROP COLUMN "appointmentStart",
ADD COLUMN     "slotId" INTEGER;

-- CreateTable
CREATE TABLE "ScheduleSlot" (
    "id" SERIAL NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScheduleSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleSlot_scheduleId_idx" ON "ScheduleSlot"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_slotId_key" ON "Appointment"("slotId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "ScheduleSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleSlot" ADD CONSTRAINT "ScheduleSlot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "DoctorSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
