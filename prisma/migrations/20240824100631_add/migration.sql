/*
  Warnings:

  - Added the required column `expiration_date` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "expiration_date" TIMESTAMP(3) NOT NULL;
