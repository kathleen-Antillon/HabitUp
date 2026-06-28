-- CreateTable
CREATE TABLE "ChallengeJoinRequest" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "ChallengeJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChallengeJoinRequest_invitedUserId_status_idx" ON "ChallengeJoinRequest"("invitedUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeJoinRequest_challengeId_invitedUserId_key" ON "ChallengeJoinRequest"("challengeId", "invitedUserId");

-- AddForeignKey
ALTER TABLE "ChallengeJoinRequest" ADD CONSTRAINT "ChallengeJoinRequest_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeJoinRequest" ADD CONSTRAINT "ChallengeJoinRequest_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeJoinRequest" ADD CONSTRAINT "ChallengeJoinRequest_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
