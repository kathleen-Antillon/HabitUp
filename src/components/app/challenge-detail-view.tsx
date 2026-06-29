"use client";

import { ClipboardList, Info, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { ChallengeCaughtSection } from "@/components/app/challenge-caught-section";
import { ChallengeGoalsTab } from "@/components/app/challenge-goals-tab";
import { ChallengeHeaderEdit, ChallengeInfoEdit } from "@/components/app/challenge-info-edit";
import { ChallengeInfoTab } from "@/components/app/challenge-info-tab";
import { ChallengeInviteJoinButton } from "@/components/app/challenge-invite-join-button";
import { ChallengeManageActions } from "@/components/app/challenge-manage-actions";
import { ChallengeRankingList } from "@/components/app/challenge-ranking-list";
import { ChallengeReportsTab } from "@/components/app/challenge-reports-tab";
import { ChallengeShareButton } from "@/components/app/challenge-share-button";
import { ChallengeTypeIcon } from "@/components/app/challenge-type-icon";
import { PoliceReportModalGate } from "@/components/app/police-report-modal";
import type { GoalReportView, ProgressByDate } from "@/lib/challenges";
import { tabActiveClass } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

type TabId = "info" | "goals" | "ranking" | "reports";

const baseTabs: { id: TabId; label: string; icon: typeof Info }[] = [
  { id: "info", label: "Información", icon: Info },
  { id: "goals", label: "Objetivos", icon: Target },
  { id: "ranking", label: "Ranking", icon: Trophy },
];

const reportsTab = { id: "reports" as const, label: "Reportes", icon: ClipboardList };

type DailyGoal = { id: string; label: string; order: number };

type ChallengeData = {
  id: string;
  name: string;
  description: string;
  type: string;
  mainGoal: string;
  startDate: Date | string;
  endDate: Date | string;
  inviteCode: string;
  createdBy: { username: string };
  createdById: string;
  dailyGoals: DailyGoal[];
};

type Props = {
  challenge: ChallengeData;
  currentUserId: string;
  isCreator: boolean;
  isActiveMember: boolean;
  isLeft: boolean;
  canRespondToInvite?: boolean;
  pendingJoinRequestId?: string | null;
  completedGoalIds: string[];
  currentDay: number;
  totalDays: number;
  daysRemaining: number;
  userCompletedDays: number;
  todayGoalsComplete: boolean;
  todayGoalsPartial: boolean;
  ranking: {
    userId: string;
    username: string;
    completedDays: number;
    memberStatus: string;
  }[];
  initialTab?: TabId;
  expandGoals?: boolean;
  progressByDate: ProgressByDate;
  allReports: GoalReportView[];
  pendingReportsAgainstUser: string[];
};

type EditableFields = {
  name: string;
  description: string;
  mainGoal: string;
  startDate: Date | string;
  endDate: Date | string;
};

function fieldsFromChallenge(challenge: ChallengeData): EditableFields {
  return {
    name: challenge.name,
    description: challenge.description,
    mainGoal: challenge.mainGoal,
    startDate: challenge.startDate,
    endDate: challenge.endDate,
  };
}

export function ChallengeDetailView({
  challenge,
  currentUserId,
  isCreator,
  isActiveMember,
  isLeft,
  canRespondToInvite = false,
  pendingJoinRequestId = null,
  completedGoalIds,
  currentDay,
  totalDays,
  daysRemaining,
  userCompletedDays,
  todayGoalsComplete,
  todayGoalsPartial,
  ranking,
  initialTab,
  expandGoals = false,
  progressByDate,
  allReports,
  pendingReportsAgainstUser,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab ?? "info");
  const [isEditing, setIsEditing] = useState(false);
  const [fields, setFields] = useState<EditableFields>(() => fieldsFromChallenge(challenge));

  useEffect(() => {
    setFields(fieldsFromChallenge(challenge));
  }, [challenge]);

  function resetFields() {
    setFields(fieldsFromChallenge(challenge));
  }

  function handleCancelEdit() {
    resetFields();
    setIsEditing(false);
  }

  function handleTabChange(tab: TabId) {
    if (isEditing && tab !== "info") {
      handleCancelEdit();
    }
    setActiveTab(tab);
  }

  const displayName = isEditing ? fields.name : challenge.name;
  const displayDescription = isEditing ? fields.description : challenge.description;
  const tabs = isCreator ? [...baseTabs, reportsTab] : baseTabs;
  const pendingReportCount = allReports.filter((r) => r.status === "PENDING").length;

  return (
    <>
      <PoliceReportModalGate reportIds={pendingReportsAgainstUser} />
      <div className="px-3 py-6 sm:px-4">
      <article className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex items-start gap-3">
          <ChallengeTypeIcon type={challenge.type} size="lg" />
          {isCreator && isEditing ? (
            <ChallengeHeaderEdit
              name={fields.name}
              description={fields.description}
              onNameChange={(name) => setFields((prev) => ({ ...prev, name }))}
              onDescriptionChange={(description) =>
                setFields((prev) => ({ ...prev, description }))
              }
            />
          ) : (
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-lg font-bold leading-tight text-slate-900">
                {displayName}
              </h1>
              <p className="mt-1 break-words text-sm leading-snug text-slate-500">
                {displayDescription}
              </p>
            </div>
          )}
          {(isActiveMember || isCreator) && (
            <ChallengeShareButton inviteCode={challenge.inviteCode} />
          )}
        </div>
        <div className="my-3 border-t border-slate-100" />
        <p className="text-sm text-slate-500">
          Creado por{" "}
          <span className="font-medium text-slate-700">
            {challenge.createdBy.username}
            {isCreator && " (tú)"}
          </span>
        </p>
        {canRespondToInvite && (
          <ChallengeInviteJoinButton
            inviteCode={challenge.inviteCode}
            pendingJoinRequestId={pendingJoinRequestId}
          />
        )}
      </article>

      <div className="mb-4 flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-0.5 py-2 text-[10px] font-semibold transition-colors min-[380px]:px-1 min-[380px]:py-2.5 min-[380px]:text-xs",
                isActive
                  ? tabActiveClass
                  : "text-slate-400 hover:text-slate-500"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
              <span className="truncate">{tab.label}</span>
              {tab.id === "reports" && pendingReportCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {pendingReportCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "goals" ? (
        <ChallengeGoalsTab
          challengeId={challenge.id}
          goals={challenge.dailyGoals}
          isCreator={isCreator}
          isActiveMember={isActiveMember}
          initialCompleted={completedGoalIds}
          currentDay={currentDay}
          totalDays={totalDays}
          daysRemaining={daysRemaining}
          userCompletedDays={userCompletedDays}
          todayGoalsComplete={todayGoalsComplete}
          todayGoalsPartial={todayGoalsPartial}
          expandGoals={expandGoals}
          startDate={challenge.startDate}
          endDate={challenge.endDate}
          progressByDate={progressByDate}
        />
      ) : activeTab === "reports" ? (
        <ChallengeReportsTab reports={allReports} />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          {activeTab === "info" &&
            (isCreator && isEditing ? (
              <ChallengeInfoEdit
                challengeId={challenge.id}
                challenge={fields}
                isLeft={isLeft}
                inviteCode={challenge.inviteCode}
                onFieldsChange={(updated) =>
                  setFields((prev) => ({
                    ...prev,
                    mainGoal: updated.mainGoal,
                    startDate: updated.startDate,
                    endDate: updated.endDate,
                  }))
                }
                onCancel={handleCancelEdit}
                onSaved={() => setIsEditing(false)}
              />
            ) : (
              <ChallengeInfoTab
                mainGoal={challenge.mainGoal}
                startDate={challenge.startDate}
                endDate={challenge.endDate}
                isLeft={isLeft && !canRespondToInvite}
                inviteCode={challenge.inviteCode}
                onEdit={isCreator ? () => setIsEditing(true) : undefined}
              />
            ))}

          {activeTab === "ranking" && (
            <div>
              <h2 className="mb-3 text-base font-semibold text-slate-900">Ranking</h2>
              <ChallengeRankingList ranking={ranking} currentUserId={currentUserId} />
            </div>
          )}
        </div>
      )}

      {activeTab === "ranking" && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <ChallengeCaughtSection
            challengeId={challenge.id}
            currentUserId={currentUserId}
            isActiveMember={isActiveMember}
            ranking={ranking}
            startDate={challenge.startDate}
            endDate={challenge.endDate}
          />
        </div>
      )}

      {activeTab === "info" && !canRespondToInvite && (
        <ChallengeManageActions
          challengeId={challenge.id}
          challengeName={challenge.name}
          isCreator={isCreator}
          isActiveMember={isActiveMember}
        />
      )}
    </div>
    </>
  );
}
