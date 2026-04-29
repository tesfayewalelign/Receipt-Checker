/*
  Warnings:

  - You are about to drop the column `keyHash` on the `ApiKey` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "keyHash",
ADD COLUMN     "dailyLimit" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");
