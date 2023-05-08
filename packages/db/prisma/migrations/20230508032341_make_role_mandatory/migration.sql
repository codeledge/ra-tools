/*
  Warnings:

  - Made the column `role` on table `AdminUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AdminUser" ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'READER';
