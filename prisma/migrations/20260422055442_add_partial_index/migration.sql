-- CreateIndex
CREATE UNIQUE INDEX "Vote_unique_actives_idx" ON "Vote"("votingId", "voterToken") WHERE "revokedAt" IS NULL;