/*
  Warnings:

  - The `contact` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "contact",
ADD COLUMN     "contact" INTEGER[];
