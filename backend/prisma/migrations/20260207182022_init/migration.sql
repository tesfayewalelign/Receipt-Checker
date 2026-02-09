/*
  Warnings:

  - You are about to drop the column `payerAccount` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `payerName` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `receiverAccount` on the `Verification` table. All the data in the column will be lost.
  - You are about to drop the column `receiverName` on the `Verification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Verification" DROP COLUMN "payerAccount",
DROP COLUMN "payerName",
DROP COLUMN "reason",
DROP COLUMN "receiverAccount",
DROP COLUMN "receiverName";
