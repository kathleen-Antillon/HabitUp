"use server";

import { nanoid } from "nanoid";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getDailyGoalsForDate } from "@/lib/challenges";
import { createReportPenitencia } from "@/lib/penitencias";
import { prisma } from "@/lib/db";
import { startOfDay, parseInputDate } from "@/lib/utils";
import type { ActionResult } from "./auth";

export async function createChallengeAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const name = (formData.get("name") as string)?.trim();
  const type = formData.get("type") as string;
  const description = (formData.get("description") as string)?.trim();
  const mainGoal = (formData.get("mainGoal") as string)?.trim();
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const dailyGoalsRaw = formData.get("dailyGoals") as string;

  if (!name || !type || !description || !mainGoal || !startDateStr || !endDateStr) {
    return { error: "Completa todos los campos requeridos." };
  }

  const startDate = startOfDay(new Date(startDateStr));
  const endDate = startOfDay(new Date(endDateStr));

  if (endDate < startDate) {
    return { error: "La fecha de fin debe ser posterior a la de inicio." };
  }

  const dailyGoals: string[] = dailyGoalsRaw
    ? JSON.parse(dailyGoalsRaw).filter((g: string) => g.trim())
    : [];

  const inviteCode = nanoid(8);

  const challenge = await prisma.challenge.create({
    data: {
      name,
      type,
      description,
      mainGoal,
      startDate,
      endDate,
      inviteCode,
      createdById: session.id,
      dailyGoals: {
        create: dailyGoals.map((label: string, order: number) => ({ label, order })),
      },
      members: {
        create: { userId: session.id, status: "ACTIVE" },
      },
    },
  });

  await prisma.user.update({
    where: { id: session.id },
    data: { focusChallengeId: challenge.id, isNewUser: false },
  });

  redirect(`/app/challenges/${challenge.id}`);
}

export async function joinChallengeAction(inviteCode: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const challenge = await prisma.challenge.findUnique({
    where: { inviteCode },
  });

  if (!challenge) return { error: "Código de invitación inválido." };

  const existing = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId: session.id, challengeId: challenge.id },
    },
  });

  if (existing) {
    if (existing.status === "LEFT") {
      await prisma.challengeMember.update({
        where: { id: existing.id },
        data: { status: "ACTIVE" },
      });
    }
  } else {
    await prisma.challengeMember.create({
      data: { userId: session.id, challengeId: challenge.id },
    });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { focusChallengeId: challenge.id, isNewUser: false },
  });

  return {
    success: "Te uniste al reto.",
    redirectTo: `/app/challenges/${challenge.id}`,
  };
}

export async function setFocusChallengeAction(challengeId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const membership = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId: session.id, challengeId },
    },
  });

  if (!membership || membership.status !== "ACTIVE") {
    return { error: "Debes ser participante activo del reto." };
  }

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { status: true },
  });

  if (!challenge || challenge.status !== "ACTIVE") {
    return { error: "Este reto no está activo." };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { focusChallengeId: challengeId },
  });

  revalidatePath("/app/home");
  return { success: "Reto anclado como principal." };
}

export async function updateChallengeAction(
  challengeId: string,
  data: {
    name: string;
    description: string;
    mainGoal: string;
    startDate: string;
    endDate: string;
  }
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { createdById: true },
  });

  if (!challenge) return { error: "Reto no encontrado." };
  if (challenge.createdById !== session.id) {
    return { error: "Solo el creador puede editar este reto." };
  }

  const name = data.name.trim();
  const description = data.description.trim();
  const mainGoal = data.mainGoal.trim();

  if (!name || !description || !mainGoal || !data.startDate || !data.endDate) {
    return { error: "Completa todos los campos requeridos." };
  }

  const startDate = startOfDay(new Date(data.startDate));
  const endDate = startOfDay(new Date(data.endDate));

  if (endDate < startDate) {
    return { error: "La fecha de fin debe ser posterior a la de inicio." };
  }

  await prisma.challenge.update({
    where: { id: challengeId },
    data: { name, description, mainGoal, startDate, endDate },
  });

  revalidatePath(`/app/challenges/${challengeId}`);
  revalidatePath("/app/challenges");
  revalidatePath("/app/home");

  return { success: "Reto actualizado." };
}

export async function saveDailyProgressAction(
  challengeId: string,
  completedGoalIds: string[]
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { error: "Debes iniciar sesión." };

    const membership = await prisma.challengeMember.findUnique({
      where: {
        userId_challengeId: { userId: session.id, challengeId },
      },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return { error: "Debes ser participante activo para guardar tu progreso." };
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { dailyGoals: true },
    });

    if (!challenge) return { error: "Reto no encontrado." };

    const today = startOfDay();
    const goalsForToday = getDailyGoalsForDate(challenge.dailyGoals, "FIXED", today);

    if (goalsForToday.length === 0) {
      return { error: "Este reto no tiene objetivos diarios para completar." };
    }

    const validGoalIds = new Set(goalsForToday.map((goal) => goal.id));
    const filteredCompleted = completedGoalIds.filter((id) => validGoalIds.has(id));
    const completed = filteredCompleted.length;
    const isComplete = completed === goalsForToday.length;
    const isPartial = completed > 0 && completed < goalsForToday.length;

    await prisma.dailyProgress.upsert({
      where: {
        userId_challengeId_date: {
          userId: session.id,
          challengeId,
          date: today,
        },
      },
      create: {
        userId: session.id,
        challengeId,
        date: today,
        completedGoalIds: JSON.stringify(filteredCompleted),
        isComplete,
        isPartial,
      },
      update: {
        completedGoalIds: JSON.stringify(filteredCompleted),
        isComplete,
        isPartial,
      },
    });

    revalidatePath(`/app/challenges/${challengeId}`);
    revalidatePath("/app/home");

    return { success: "Progreso guardado." };
  } catch {
    return { error: "No se pudo guardar el progreso. Inténtalo de nuevo." };
  }
}

export async function updateDailyGoalsAction(
  challengeId: string,
  goals: { id?: string; label: string }[]
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { error: "Debes iniciar sesión." };

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { createdById: true },
    });

    if (!challenge) return { error: "Reto no encontrado." };

    if (challenge.createdById !== session.id) {
      return { error: "Solo el creador del reto puede editar los objetivos diarios." };
    }

    const normalized = goals
      .map((goal, order) => ({ id: goal.id, label: goal.label.trim(), order }))
      .filter((goal) => goal.label.length > 0);

    if (normalized.length === 0) {
      return { error: "Añade al menos un objetivo diario." };
    }

    const keptIds = normalized.flatMap((goal) => (goal.id ? [goal.id] : []));

    await prisma.dailyGoal.deleteMany({
      where: {
        challengeId,
        ...(keptIds.length > 0 ? { id: { notIn: keptIds } } : {}),
      },
    });

    for (const goal of normalized) {
      if (goal.id) {
        const existing = await prisma.dailyGoal.findFirst({
          where: { id: goal.id, challengeId },
        });
        if (!existing) continue;

        await prisma.dailyGoal.update({
          where: { id: goal.id },
          data: { label: goal.label, order: goal.order, date: null },
        });
      } else {
        await prisma.dailyGoal.create({
          data: { challengeId, label: goal.label, order: goal.order, date: null },
        });
      }
    }

    revalidatePath(`/app/challenges/${challengeId}`);
    revalidatePath("/app/home");

    return { success: "Objetivos diarios actualizados." };
  } catch {
    return { error: "No se pudieron guardar los objetivos. Inténtalo de nuevo." };
  }
}

export async function leaveChallengeAction(challengeId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const membership = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId: session.id, challengeId },
    },
  });

  if (!membership || membership.status === "LEFT") {
    return { error: "No estás participando en este reto." };
  }

  await prisma.challengeMember.update({
    where: { id: membership.id },
    data: { status: "LEFT" },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { focusChallengeId: true },
  });

  if (user?.focusChallengeId === challengeId) {
    await prisma.user.update({
      where: { id: session.id },
      data: { focusChallengeId: null },
    });
  }

  redirect("/app/challenges");
}

export async function clearAbandonedChallengesAction(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const toRemove = await prisma.challengeMember.findMany({
    where: {
      userId: session.id,
      OR: [{ status: "LEFT" }, { challenge: { status: "ABANDONED" } }],
    },
    select: { id: true, challengeId: true },
  });

  if (toRemove.length === 0) {
    return { error: "No tienes retos no continuados para limpiar." };
  }

  const challengeIds = toRemove.map((m) => m.challengeId);

  await prisma.challengeMember.deleteMany({
    where: { id: { in: toRemove.map((m) => m.id) } },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { focusChallengeId: true },
  });

  if (user?.focusChallengeId && challengeIds.includes(user.focusChallengeId)) {
    await prisma.user.update({
      where: { id: session.id },
      data: { focusChallengeId: null },
    });
  }

  revalidatePath("/app/challenges");
  revalidatePath("/app/home");

  return { success: "Retos no continuados eliminados de tu lista." };
}

export async function deleteChallengeAction(challengeId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    select: { createdById: true },
  });

  if (!challenge) return { error: "Reto no encontrado." };

  if (challenge.createdById !== session.id) {
    return { error: "Solo quien creó el reto puede eliminarlo." };
  }

  await prisma.user.updateMany({
    where: { focusChallengeId: challengeId },
    data: { focusChallengeId: null },
  });

  await prisma.challenge.delete({ where: { id: challengeId } });

  redirect("/app/challenges");
}

export async function searchUsersAction(query: string) {
  const session = await getSession();
  if (!session || !query.trim()) return [];

  return prisma.user.findMany({
    where: {
      AND: [
        { id: { not: session.id } },
        {
          OR: [
            { username: { contains: query } },
            { email: { contains: query } },
          ],
        },
      ],
    },
    select: { id: true, username: true, email: true },
    take: 5,
  });
}

export async function submitAtrapadoReportAction(
  challengeId: string,
  reportedUserId: string,
  dateStr: string,
  reason?: string
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session) return { error: "Debes iniciar sesión." };

    if (reportedUserId === session.id) {
      return { error: "No puedes reportarte a ti mismo." };
    }

    const membership = await prisma.challengeMember.findUnique({
      where: { userId_challengeId: { userId: session.id, challengeId } },
    });

    if (!membership || membership.status !== "ACTIVE") {
      return { error: "Debes ser participante activo para reportar." };
    }

    const reportedMembership = await prisma.challengeMember.findUnique({
      where: { userId_challengeId: { userId: reportedUserId, challengeId } },
    });

    if (!reportedMembership || reportedMembership.status !== "ACTIVE") {
      return { error: "Solo puedes reportar a participantes activos." };
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { startDate: true, endDate: true, createdById: true },
    });

    if (!challenge) return { error: "Reto no encontrado." };

    const date = parseInputDate(dateStr);
    const challengeStart = startOfDay(challenge.startDate);
    const challengeEnd = startOfDay(challenge.endDate);
    const today = startOfDay();

    if (date < challengeStart || date > challengeEnd) {
      return { error: "La fecha debe estar dentro del periodo del reto." };
    }

    if (date >= today) {
      return { error: "Solo puedes reportar días anteriores a hoy." };
    }

    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_challengeId_date: { userId: reportedUserId, challengeId, date },
      },
    });

    if (!progress?.isComplete) {
      return { error: "Solo puedes reportar a quien marcó el día como completado." };
    }

    const trimmedReason = reason?.trim() || null;

    await prisma.goalReport.create({
      data: {
        challengeId,
        reportedUserId,
        reporterUserId: session.id,
        date,
        reason: trimmedReason,
      },
    });

    revalidatePath(`/app/challenges/${challengeId}`);
    return { success: "Reporte enviado al creador del reto." };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ya reportaste a este usuario por ese día." };
    }
    return { error: "No se pudo enviar el reporte. Inténtalo de nuevo." };
  }
}

export async function resolveAtrapadoReportAction(
  reportId: string,
  resolution: "INVALIDATE_DAY" | "KICK_MEMBER" | "DISMISS"
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const report = await prisma.goalReport.findUnique({
    where: { id: reportId },
    include: {
      challenge: { select: { createdById: true } },
    },
  });

  if (!report) return { error: "Reporte no encontrado." };
  if (report.challenge.createdById !== session.id) {
    return { error: "Solo el creador del reto puede resolver reportes." };
  }
  if (report.status !== "PENDING") {
    return { error: "Este reporte ya fue resuelto." };
  }

  if (resolution === "DISMISS") {
    await prisma.goalReport.update({
      where: { id: reportId },
      data: {
        status: "DISMISSED",
        resolution: "DISMISS",
        resolvedAt: new Date(),
      },
    });
  } else if (resolution === "INVALIDATE_DAY") {
    await prisma.$transaction([
      prisma.dailyProgress.updateMany({
        where: {
          userId: report.reportedUserId,
          challengeId: report.challengeId,
          date: report.date,
        },
        data: {
          isComplete: false,
          isPartial: false,
          completedGoalIds: "[]",
        },
      }),
      prisma.goalReport.update({
        where: { id: reportId },
        data: {
          status: "UPHELD",
          resolution: "INVALIDATE_DAY",
          resolvedAt: new Date(),
        },
      }),
    ]);
    await createReportPenitencia(
      reportId,
      report.reportedUserId,
      report.challengeId,
      report.date,
      "INVALIDATE_DAY",
      session.id,
      report.reason
    );
  } else if (resolution === "KICK_MEMBER") {
    const membership = await prisma.challengeMember.findUnique({
      where: {
        userId_challengeId: {
          userId: report.reportedUserId,
          challengeId: report.challengeId,
        },
      },
    });

    if (membership && membership.status === "ACTIVE") {
      await prisma.$transaction([
        prisma.challengeMember.update({
          where: { id: membership.id },
          data: { status: "LEFT" },
        }),
        prisma.goalReport.update({
          where: { id: reportId },
          data: {
            status: "UPHELD",
            resolution: "KICK_MEMBER",
            resolvedAt: new Date(),
          },
        }),
      ]);

      await prisma.user.updateMany({
        where: { focusChallengeId: report.challengeId, id: report.reportedUserId },
        data: { focusChallengeId: null },
      });
    } else {
      await prisma.goalReport.update({
        where: { id: reportId },
        data: {
          status: "UPHELD",
          resolution: "KICK_MEMBER",
          resolvedAt: new Date(),
        },
      });
    }

    await createReportPenitencia(
      reportId,
      report.reportedUserId,
      report.challengeId,
      report.date,
      "KICK_MEMBER",
      session.id,
      report.reason
    );
  }

  revalidatePath(`/app/challenges/${report.challengeId}`);
  revalidatePath("/app/home");
  revalidatePath("/app/challenges");
  revalidatePath("/app/penitencias");

  const messages: Record<string, string> = {
    DISMISS: "Reporte descartado.",
    INVALIDATE_DAY: "Día anulado para el participante reportado.",
    KICK_MEMBER: "Participante expulsado del reto.",
  };

  return { success: messages[resolution] };
}
