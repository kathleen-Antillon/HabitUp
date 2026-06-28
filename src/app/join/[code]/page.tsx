import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CHALLENGE_TYPE_LABELS, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinChallengeButton } from "@/components/app/join-challenge-button";

export default async function JoinPage({
  params,
}: {
  params: { code: string };
}) {
  const session = await getSession();
  const challenge = await prisma.challenge.findUnique({
    where: { inviteCode: params.code },
    include: {
      members: {
        where: { status: "ACTIVE" },
        include: { user: { select: { username: true } } },
      },
    },
  });

  if (!challenge) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invitación inválida</h1>
          <p className="mt-2 text-slate-600">Este link de invitación no existe o expiró.</p>
          <Button asChild className="mt-6">
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    redirect(`/register?invite=${params.code}`);
  }

  const existing = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId: session.id, challengeId: challenge.id },
    },
  });

  if (existing?.status === "ACTIVE") {
    redirect(`/app/challenges/${challenge.id}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge variant="secondary" className="mb-2 w-fit">
            {CHALLENGE_TYPE_LABELS[challenge.type]}
          </Badge>
          <CardTitle>¿Quieres unirte a {challenge.name}?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">{challenge.description}</p>
          <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-1">
            <p><strong>Duración:</strong> {formatDate(challenge.startDate)} — {formatDate(challenge.endDate)}</p>
            <p><strong>Participantes:</strong> {challenge.members.map((m) => m.user.username).join(", ") || "Ninguno aún"}</p>
          </div>
          <div className="flex justify-end">
            <JoinChallengeButton inviteCode={params.code} className="w-full sm:w-auto" />
          </div>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/app/home">Cancelar</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
