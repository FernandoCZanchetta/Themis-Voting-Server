-- CreateTable
CREATE TABLE "Voting" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "voteType" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "allowedCourses" TEXT[],
    "allowedInstitutes" TEXT[],
    "allowedCampi" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Voting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "votingId" TEXT NOT NULL,
    "voterToken" TEXT NOT NULL,
    "voteData" JSONB NOT NULL,
    "nonce" TEXT NOT NULL,
    "voteHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3)
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_voteHash_key" ON "Vote"("voteHash");

-- CreateIndex
CREATE INDEX "Vote_votingId_voterToken_idx" ON "Vote"("votingId", "voterToken");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
