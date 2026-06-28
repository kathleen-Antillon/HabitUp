import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const NotificationType = {
  JOIN_REQUEST: "JOIN_REQUEST",
  MEMBER_JOINED: "MEMBER_JOINED",
  MEMBER_LEFT: "MEMBER_LEFT",
  CHALLENGE_DELETED: "CHALLENGE_DELETED",
  PENITENCIA_RECEIVED: "PENITENCIA_RECEIVED",
  PENITENCIA_CREATED: "PENITENCIA_CREATED",
  ATRAPADO_RECEIVED: "ATRAPADO_RECEIVED",
  ATRAPADO_REPORTED: "ATRAPADO_REPORTED",
} as const;

export type NotificationTypeValue =
  (typeof NotificationType)[keyof typeof NotificationType];

export type NotificationView = {
  id: string;
  type: NotificationTypeValue;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  challengeId: string | null;
  actorUserId: string | null;
  targetUserId: string | null;
  entityId: string | null;
};

type CreateNotificationInput = {
  userId: string;
  type: NotificationTypeValue;
  title: string;
  body: string;
  href?: string | null;
  challengeId?: string | null;
  actorUserId?: string | null;
  targetUserId?: string | null;
  entityId?: string | null;
};

async function getActiveMemberIds(
  challengeId: string,
  excludeUserIds: string[] = []
): Promise<string[]> {
  const members = await prisma.challengeMember.findMany({
    where: {
      challengeId,
      status: "ACTIVE",
      userId: excludeUserIds.length > 0 ? { notIn: excludeUserIds } : undefined,
    },
    select: { userId: true },
  });

  return members.map((member) => member.userId);
}

async function usersShareActiveChallenge(
  userIdA: string,
  userIdB: string
): Promise<boolean> {
  const userAChallenges = await prisma.challengeMember.findMany({
    where: { userId: userIdA, status: "ACTIVE" },
    select: { challengeId: true },
  });

  if (userAChallenges.length === 0) return false;

  const shared = await prisma.challengeMember.findFirst({
    where: {
      userId: userIdB,
      status: "ACTIVE",
      challengeId: { in: userAChallenges.map((membership) => membership.challengeId) },
    },
    select: { userId: true },
  });

  return !!shared;
}

async function usersShareChallengeContext(
  userIdA: string,
  userIdB: string,
  challengeId: string | null | undefined
): Promise<boolean> {
  if (!challengeId) return false;

  const memberships = await prisma.challengeMember.findMany({
    where: {
      challengeId,
      userId: { in: [userIdA, userIdB] },
    },
    select: { userId: true, status: true },
  });

  const membershipA = memberships.find((membership) => membership.userId === userIdA);
  const membershipB = memberships.find((membership) => membership.userId === userIdB);

  if (!membershipA || !membershipB) return false;

  return membershipA.status === "ACTIVE" || membershipB.status === "ACTIVE";
}

function isPersonalNotificationType(type: NotificationTypeValue) {
  return (
    type === NotificationType.PENITENCIA_RECEIVED ||
    type === NotificationType.ATRAPADO_RECEIVED
  );
}

function bypassesSharedChallengeFilter(type: NotificationTypeValue) {
  return (
    isPersonalNotificationType(type) ||
    type === NotificationType.CHALLENGE_DELETED
  );
}

async function canReceiveNotificationAboutUser(
  recipientId: string,
  subjectUserId: string,
  challengeId?: string | null
): Promise<boolean> {
  if (recipientId === subjectUserId) return true;
  if (await usersShareActiveChallenge(recipientId, subjectUserId)) return true;
  return usersShareChallengeContext(recipientId, subjectUserId, challengeId);
}

async function filterRecipientsAboutUser(
  candidateUserIds: string[],
  subjectUserId: string,
  challengeId?: string | null
): Promise<string[]> {
  const uniqueCandidates = Array.from(new Set(candidateUserIds.filter(Boolean)));
  if (uniqueCandidates.length === 0) return [];

  const checks = await Promise.all(
    uniqueCandidates.map(async (candidateId) => ({
      candidateId,
      allowed: await canReceiveNotificationAboutUser(
        candidateId,
        subjectUserId,
        challengeId
      ),
    }))
  );

  return checks.filter((check) => check.allowed).map((check) => check.candidateId);
}

async function getEligibleRecipientsAboutUser(
  challengeId: string,
  subjectUserId: string,
  excludeUserIds: string[] = []
): Promise<string[]> {
  const candidates = await getActiveMemberIds(challengeId, [
    ...excludeUserIds,
    subjectUserId,
  ]);

  return filterRecipientsAboutUser(candidates, subjectUserId, challengeId);
}

export async function createNotification(input: CreateNotificationInput) {
  try {
    return await prisma.notification.create({ data: input });
  } catch (error) {
    console.error("[notifications] createNotification failed", error);
    return null;
  }
}

export async function createNotifications(
  userIds: string[],
  input: Omit<CreateNotificationInput, "userId">
) {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  if (uniqueUserIds.length === 0) return;

  try {
    await prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({ ...input, userId })),
    });
  } catch (error) {
    console.error("[notifications] createNotifications failed", error);
  }
}

export async function getNotificationsForUser(
  userId: string,
  limit = 50
): Promise<NotificationView[]> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const filtered: NotificationView[] = [];

    for (const notification of notifications) {
      const typedNotification: NotificationView = {
        ...notification,
        type: notification.type as NotificationTypeValue,
      };

      if (bypassesSharedChallengeFilter(typedNotification.type)) {
        filtered.push(typedNotification);
        continue;
      }

      if (typedNotification.type === NotificationType.JOIN_REQUEST) {
        filtered.push(typedNotification);
        continue;
      }

      const subjectUserId =
        typedNotification.targetUserId ?? typedNotification.actorUserId;
      if (!subjectUserId) {
        filtered.push(typedNotification);
        continue;
      }

      const allowed = await canReceiveNotificationAboutUser(
        userId,
        subjectUserId,
        typedNotification.challengeId
      );

      if (allowed) filtered.push(typedNotification);
    }

    return filtered;
  } catch (error) {
    console.error("[notifications] getNotificationsForUser failed", error);
    return [];
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const notifications = await getNotificationsForUser(userId, 100);
    return notifications.filter((notification) => !notification.readAt).length;
  } catch (error) {
    console.error("[notifications] getUnreadNotificationCount failed", error);
    return 0;
  }
}

export async function markNotificationRead(notificationId: string, userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch (error) {
    console.error("[notifications] markNotificationRead failed", error);
  }
}

export async function markAllNotificationsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  } catch (error) {
    console.error("[notifications] markAllNotificationsRead failed", error);
  }
}

export async function notifyJoinRequest({
  invitedUserId,
  invitedById,
  invitedByUsername,
  challengeId,
  challengeName,
  inviteCode,
  joinRequestId,
}: {
  invitedUserId: string;
  invitedById: string;
  invitedByUsername: string;
  challengeId: string;
  challengeName: string;
  inviteCode: string;
  joinRequestId: string;
}) {
  const sharesActiveChallenge = await usersShareActiveChallenge(
    invitedUserId,
    invitedById
  );

  if (!sharesActiveChallenge) {
    const inviterInChallenge = await prisma.challengeMember.findFirst({
      where: { userId: invitedById, challengeId, status: "ACTIVE" },
      select: { userId: true },
    });
    if (!inviterInChallenge) return;
  }

  await createNotification({
    userId: invitedUserId,
    type: NotificationType.JOIN_REQUEST,
    title: "Solicitud para unirte a un reto",
    body: `${invitedByUsername} te invitó a unirte a ${challengeName}.`,
    href: `/app/challenges/${challengeId}?invite=${encodeURIComponent(inviteCode)}`,
    challengeId,
    actorUserId: invitedById,
    entityId: joinRequestId,
  });
}

export async function notifyMemberJoined({
  challengeId,
  joinerId,
  joinerUsername,
}: {
  challengeId: string;
  joinerId: string;
  joinerUsername: string;
}) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { name: true },
  });
  if (!challenge) return;

  const recipientIds = await getEligibleRecipientsAboutUser(challengeId, joinerId);
  await createNotifications(recipientIds, {
    type: NotificationType.MEMBER_JOINED,
    title: "Nuevo participante",
    body: `${joinerUsername} se unió al reto ${challenge.name}.`,
    href: `/app/challenges/${challengeId}`,
    challengeId,
    actorUserId: joinerId,
  });
}

export async function notifyMemberLeft({
  challengeId,
  leaverId,
  leaverUsername,
}: {
  challengeId: string;
  leaverId: string;
  leaverUsername: string;
}) {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { name: true },
  });
  if (!challenge) return;

  const recipientIds = await getEligibleRecipientsAboutUser(challengeId, leaverId);
  await createNotifications(recipientIds, {
    type: NotificationType.MEMBER_LEFT,
    title: "Participante abandonó el reto",
    body: `${leaverUsername} dejó el reto ${challenge.name}.`,
    href: `/app/challenges/${challengeId}`,
    challengeId,
    actorUserId: leaverId,
  });
}

export async function notifyChallengeDeleted({
  challengeId,
  challengeName,
  creatorId,
  creatorUsername,
  memberUserIds,
}: {
  challengeId: string;
  challengeName: string;
  creatorId: string;
  creatorUsername: string;
  memberUserIds: string[];
}) {
  const recipientIds = await filterRecipientsAboutUser(
    memberUserIds.filter((id) => id !== creatorId),
    creatorId,
    challengeId
  );
  await createNotifications(recipientIds, {
    type: NotificationType.CHALLENGE_DELETED,
    title: "Reto eliminado",
    body: `${creatorUsername} eliminó el reto ${challengeName}.`,
    href: "/app/challenges",
    challengeId,
    actorUserId: creatorId,
  });
}

export async function notifyPenitenciaCreated({
  penitenciaId,
  userId,
  username,
  challengeId,
  challengeName,
  reason,
}: {
  penitenciaId: string;
  userId: string;
  username: string;
  challengeId: string;
  challengeName: string;
  reason: string;
}) {
  await createNotification({
    userId,
    type: NotificationType.PENITENCIA_RECEIVED,
    title: "Nueva penitencia",
    body: `Recibiste una penitencia en ${challengeName}: ${reason}`,
    href: "/app/penitencias",
    challengeId,
    targetUserId: userId,
    entityId: penitenciaId,
  });

  const recipientIds = await getEligibleRecipientsAboutUser(challengeId, userId);
  await createNotifications(recipientIds, {
    type: NotificationType.PENITENCIA_CREATED,
    title: "Penitencia generada",
    body: `${username} recibió una penitencia en ${challengeName}.`,
    href: `/app/challenges/${challengeId}`,
    challengeId,
    targetUserId: userId,
    entityId: penitenciaId,
  });
}

export async function notifyAtrapadoSubmitted({
  reportId,
  challengeId,
  challengeName,
  reporterId,
  reporterUsername,
  reportedUserId,
  reportedUsername,
  date,
}: {
  reportId: string;
  challengeId: string;
  challengeName: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  date: Date;
}) {
  const formattedDate = formatDate(date);

  await createNotification({
    userId: reportedUserId,
    type: NotificationType.ATRAPADO_RECEIVED,
    title: "Te reportaron en un reto",
    body: `${reporterUsername} te reportó en ${challengeName} por el día ${formattedDate}.`,
    href: `/app/challenges/${challengeId}`,
    challengeId,
    actorUserId: reporterId,
    targetUserId: reportedUserId,
    entityId: reportId,
  });

  const generalRecipientIds = await getEligibleRecipientsAboutUser(
    challengeId,
    reportedUserId,
    [reporterId]
  );

  await createNotifications(generalRecipientIds, {
    type: NotificationType.ATRAPADO_REPORTED,
    title: "Reporte en el reto",
    body: `${reportedUsername} fue reportado en ${challengeName} por el día ${formattedDate}.`,
    href: `/app/challenges/${challengeId}?tab=reportes`,
    challengeId,
    actorUserId: reporterId,
    targetUserId: reportedUserId,
    entityId: reportId,
  });
}

export function getNotificationTypeLabel(type: NotificationTypeValue): string {
  const labels: Record<NotificationTypeValue, string> = {
    JOIN_REQUEST: "Invitación",
    MEMBER_JOINED: "Nuevo participante",
    MEMBER_LEFT: "Abandonó el reto",
    CHALLENGE_DELETED: "Reto eliminado",
    PENITENCIA_RECEIVED: "Penitencia",
    PENITENCIA_CREATED: "Penitencia",
    ATRAPADO_RECEIVED: "Te reportaron",
    ATRAPADO_REPORTED: "Reporte",
  };
  return labels[type] ?? "Notificación";
}

export function formatNotificationTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Ahora";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays} d`;

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}
