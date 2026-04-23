/*
  Warnings:

  - You are about to drop the column `courseId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `instituteId` on the `User` table. All the data in the column will be lost.
  - The `courseCode` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `instituteCode` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `code` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `code` on the `Institute` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "code",
ADD COLUMN     "code" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Institute" DROP COLUMN "code",
ADD COLUMN     "code" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "courseId",
DROP COLUMN "instituteId",
DROP COLUMN "courseCode",
ADD COLUMN     "courseCode" INTEGER,
DROP COLUMN "instituteCode",
ADD COLUMN     "instituteCode" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Institute_code_key" ON "Institute"("code");
