import { prisma } from "@/lib/db";
import { notifyJoinRequest } from "@/lib/notifications";

export type PendingJoinRequestView = {
  id: string;
  challengeId: string;
  challengeName: string;
  invitedByUsername: string;
  createdAt: Date;
};

export function buildChallengeInviteUrl(challengeId: string, inviteCode: string) {
  return `/app/challenges/${challengeId}?invite=${encodeURIComponent(inviteCode)}`;
}

export async function getPendingJoinRequestForUserAndChallenge(
  userId: string,
  challengeId: string
) {
  try {
    const request = await prisma.challengeJoinRequest.findUnique({
      where: {
        challengeId_invitedUserId: { challengeId, invitedUserId: userId },
      },
      select: { id: true, status: true },
    });

    if (request?.status === "PENDING") {
      return request;
    }

    return null;
  } catch (error) {
    console.error("[join-requests] getPendingJoinRequestForUserAndChallenge failed", error);
    return null;
  }
}

export async function findUserByIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  return prisma.user.findFirst({
    where: {
      OR: [
        { email: trimmed.toLowerCase() },
        { username: { equals: trimmed, mode: "insensitive" } },
      ],
    },
    select: { id: true, username: true, email: true },
  });
}

export async function getPendingJoinRequestsForUser(
  userId: string
): Promise<PendingJoinRequestView[]> {
  try {
    const requests = await prisma.challengeJoinRequest.findMany({
    where: { invitedUserId: userId, status: "PENDING" },
    include: {
      challenge: { select: { id: true, name: true } },
      invitedBy: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
    });

    return requests.map((request) => ({
      id: request.id,
      challengeId: request.challenge.id,
      challengeName: request.challenge.name,
      invitedByUsername: request.invitedBy.username,
      createdAt: request.createdAt,
    }));
  } catch (error) {
    console.error("[join-requests] getPendingJoinRequestsForUser failed", error);
    return [];
  }
}

export async function getPendingJoinRequestsForChallenge(challengeId: string) {
  return prisma.challengeJoinRequest.findMany({
    where: { challengeId, status: "PENDING" },
    include: {
      invitedUser: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createJoinRequestsForChallenge(
  challengeId: string,
  invitedById: string,
  identifiers: string[]
) {
  const uniqueIdentifiers = Array.from(
    new Set(identifiers.map((v) => v.trim()).filter(Boolean))
  );
  if (uniqueIdentifiers.length === 0) return { created: 0, errors: [] as string[] };

  const errors: string[] = [];
  let created = 0;

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { name: true, inviteCode: true },
  });
  const inviter = await prisma.user.findUnique({
    where: { id: invitedById },
    select: { username: true },
  });

  if (!challenge || !inviter) {
    return { created: 0, errors: ["No se pudo enviar las invitaciones."] };
  }

  const { name: challengeName, inviteCode } = challenge;
  const invitedByUsername = inviter.username;

  async function sendJoinRequestNotification(
    invitedUserId: string,
    joinRequestId: string
  ) {
    await notifyJoinRequest({
      invitedUserId,
      invitedById,
      invitedByUsername,
      challengeId,
      challengeName,
      inviteCode,
      joinRequestId,
    });
  }

  for (const identifier of uniqueIdentifiers) {
    const user = await findUserByIdentifier(identifier);
    if (!user) {
      errors.push(`No encontramos una cuenta para "${identifier}".`);
      continue;
    }

    if (user.id === invitedById) {
      errors.push(`No puedes invitarte a ti mismo (${user.username}).`);
      continue;
    }

    const existingMember = await prisma.challengeMember.findUnique({
      where: { userId_challengeId: { userId: user.id, challengeId } },
    });

    if (existingMember?.status === "ACTIVE") {
      errors.push(`${user.username} ya participa en este reto.`);
      continue;
    }

    const existingRequest = await prisma.challengeJoinRequest.findUnique({
      where: {
        challengeId_invitedUserId: { challengeId, invitedUserId: user.id },
      },
    });

    if (existingRequest?.status === "PENDING") {
      errors.push(`${user.username} ya tiene una solicitud pendiente.`);
      continue;
    }

    if (existingRequest?.status === "DECLINED") {
      const updated = await prisma.challengeJoinRequest.update({
        where: { id: existingRequest.id },
        data: {
          status: "PENDING",
          invitedById,
          respondedAt: null,
        },
      });
      await sendJoinRequestNotification(user.id, updated.id);
      created++;
      continue;
    }

    const request = await prisma.challengeJoinRequest.create({
      data: {
        challengeId,
        invitedUserId: user.id,
        invitedById,
      },
    });
    await sendJoinRequestNotification(user.id, request.id);
    created++;
  }

  return { created, errors };
}
