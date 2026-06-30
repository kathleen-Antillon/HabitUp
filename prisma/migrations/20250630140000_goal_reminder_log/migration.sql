CREATE TABLE "GoalReminderLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalReminderLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "GoalReminderLog_userId_dateKey_key" ON "GoalReminderLog"("userId", "dateKey");
CREATE INDEX "GoalReminderLog_dateKey_idx" ON "GoalReminderLog"("dateKey");

ALTER TABLE "GoalReminderLog" ADD CONSTRAINT "GoalReminderLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
