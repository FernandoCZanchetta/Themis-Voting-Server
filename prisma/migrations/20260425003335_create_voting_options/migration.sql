-- CreateTable
CREATE TABLE "VotingOption" (
    "id" TEXT NOT NULL,
    "votingId" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "VotingOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VotingOption" ADD CONSTRAINT "VotingOption_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
