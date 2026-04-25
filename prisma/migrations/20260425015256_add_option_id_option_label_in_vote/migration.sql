/*
  Warnings:

  - You are about to drop the column `voteData` on the `Vote` table. All the data in the column will be lost.
  - Added the required column `optionId` to the `Vote` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionLabel` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Course" ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Institute" ADD CONSTRAINT "Institute_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "voteData",
ADD COLUMN     "optionId" TEXT NOT NULL,
ADD COLUMN     "optionLabel" TEXT NOT NULL,
ADD CONSTRAINT "Vote_pkey" PRIMARY KEY ("id");
