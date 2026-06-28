"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyMemberJoined } from "@/lib/notifications";
import type { ActionResult } from "./auth";

export async function acceptJoinRequestAction(requestId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const request = await prisma.challengeJoinRequest.findUnique({
    where: { id: requestId },
    include: { challenge: { select: { id: true, status: true } } },
  });

  if (!request || request.invitedUserId !== session.id) {
    return { error: "Solicitud no encontrada." };
  }

  if (request.status !== "PENDING") {
    return { error: "Esta solicitud ya fue respondida." };
  }

  if (request.challenge.status !== "ACTIVE") {
    return { error: "Este reto ya no está activo." };
  }

  await prisma.$transaction([
    prisma.challengeJoinRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED", respondedAt: new Date() },
    }),
    prisma.challengeMember.upsert({
      where: {
        userId_challengeId: {
          userId: session.id,
          challengeId: request.challengeId,
        },
      },
      create: {
        userId: session.id,
        challengeId: request.challengeId,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE" },
    }),
  ]);

  await notifyMemberJoined({
    challengeId: request.challengeId,
    joinerId: session.id,
    joinerUsername: session.username,
  });

  revalidatePath("/app/home");
  revalidatePath("/app/challenges");
  revalidatePath("/app/notifications");
  revalidatePath(`/app/challenges/${request.challengeId}`);

  return { success: "Te uniste al reto.", redirectTo: `/app/challenges/${request.challengeId}` };
}

export async function declineJoinRequestAction(requestId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const request = await prisma.challengeJoinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.invitedUserId !== session.id) {
    return { error: "Solicitud no encontrada." };
  }

  if (request.status !== "PENDING") {
    return { error: "Esta solicitud ya fue respondida." };
  }

  await prisma.challengeJoinRequest.update({
    where: { id: requestId },
    data: { status: "DECLINED", respondedAt: new Date() },
  });

  revalidatePath("/app/home");
  revalidatePath("/app/challenges");
  revalidatePath(`/app/challenges/${request.challengeId}`);

  return { success: "Solicitud rechazada." };
}
