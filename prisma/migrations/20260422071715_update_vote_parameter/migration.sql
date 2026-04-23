/*
  Warnings:

  - You are about to drop the column `signature` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `voteSignature` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "signature",
ADD COLUMN     "voteSignature" TEXT NOT NULL;
