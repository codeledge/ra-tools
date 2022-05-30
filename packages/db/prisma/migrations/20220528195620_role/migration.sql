/*
  Warnings:

  - You are about to drop the column `role` on the `AdminAccount` table. All the data in the column will be lost.
  - Added the required column `role` to the `AdminUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdminAccount" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "role" "Role" NOT NULL;
