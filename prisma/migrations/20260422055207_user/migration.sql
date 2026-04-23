-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nUSPHash" TEXT NOT NULL,
    "course" TEXT,
    "institute" TEXT,
    "campus" TEXT,
    "courseId" INTEGER NOT NULL,
    "instituteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nUSPHash_key" ON "User"("nUSPHash");
