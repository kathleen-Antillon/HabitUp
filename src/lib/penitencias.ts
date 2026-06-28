import { prisma } from "@/lib/db";
import { didMissAllGoalsYesterday } from "@/lib/challenges";
import { startOfDay, toInputDate } from "@/lib/utils";

export type PenitenciaView = {
  id: string;
  type: string;
  reason: string;
  amount: number | null;
  incidentDate: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  challenge: { id: string; name: string };
  generatedBy: { username: string } | null;
};

export async function ensureMissedGoalsPenitencia(
  userId: string,
  challengeId: string
): Promise<void> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
    include: { dailyGoals: { orderBy: { order: "asc" } } },
  });

  if (!challenge) return;

  const today = startOfDay();
  const yesterday = startOfDay(new Date(today.getTime() - 86400000));

  const yesterdayProgress = await prisma.dailyProgress.findUnique({
    where: {
      userId_challengeId_date: { userId, challengeId, date: yesterday },
    },
  });

  if (!didMissAllGoalsYesterday(challenge, yesterdayProgress, yesterday)) return;

  const existing = await prisma.penitencia.findFirst({
    where: {
      userId,
      challengeId,
      type: "MISSED_GOALS",
      incidentDate: yesterday,
    },
  });

  if (existing) return;

  await prisma.penitencia.create({
    data: {
      userId,
      challengeId,
      type: "MISSED_GOALS",
      reason: "No cumpliste con ninguno de tus objetivos ayer.",
      amount: 10,
      incidentDate: yesterday,
    },
  });
}

export async function createReportPenitencia(
  reportId: string,
  reportedUserId: string,
  challengeId: string,
  incidentDate: Date,
  resolution: "INVALIDATE_DAY" | "KICK_MEMBER",
  creatorId: string,
  reportReason: string | null
): Promise<void> {
  const existing = await prisma.penitencia.findUnique({
    where: { reportId },
  });

  if (existing) return;

  const reasonByResolution: Record<string, string> = {
    INVALIDATE_DAY:
      reportReason ??
      "Se confirmó un reporte: no cumpliste con tus objetivos en el día indicado.",
    KICK_MEMBER:
      reportReason ??
      "Se confirmó un reporte y fuiste expulsado del reto por incumplimiento.",
  };

  await prisma.penitencia.create({
    data: {
      userId: reportedUserId,
      challengeId,
      type: "REPORT_UPHELD",
      reason: reasonByResolution[resolution],
      incidentDate,
      generatedById: creatorId,
      reportId,
    },
  });
}

export async function getUserPenitencias(userId: string): Promise<PenitenciaView[]> {
  const penitencias = await prisma.penitencia.findMany({
    where: { userId },
    include: {
      challenge: { select: { id: true, name: true } },
      generatedBy: { select: { username: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return penitencias
    .map((p) => ({
    id: p.id,
    type: p.type,
    reason: p.reason,
    amount: p.amount,
    incidentDate: p.incidentDate ? toInputDate(p.incidentDate) : null,
    status: p.status,
    createdAt: p.createdAt,
    completedAt: p.completedAt,
    challenge: p.challenge,
    generatedBy: p.generatedBy,
  }))
    .sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === "PENDING" ? -1 : 1;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
}

export function getPenitenciaTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    MISSED_GOALS: "Objetivos incumplidos",
    REPORT_UPHELD: "Reporte confirmado",
  };
  return labels[type] ?? type;
}

export function getPenitenciaGeneratorLabel(
  type: string,
  generatedBy: { username: string } | null
): string {
  if (generatedBy) return generatedBy.username;
  if (type === "MISSED_GOALS") return "Sistema";
  return "Desconocido";
}
