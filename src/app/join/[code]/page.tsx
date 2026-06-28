import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildChallengeInviteUrl } from "@/lib/join-requests";
import { Button } from "@/components/ui/button";

export default async function JoinPage({
  params,
}: {
  params: { code: string };
}) {
  const challenge = await prisma.challenge.findUnique({
    where: { inviteCode: params.code },
    select: { id: true },
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

  const session = await getSession();
  if (!session) {
    redirect(`/register?invite=${params.code}`);
  }

  const existing = await prisma.challengeMember.findUnique({
    where: {
      userId_challengeId: { userId: session.id, challengeId: challenge.id },
    },
    select: { status: true },
  });

  if (existing?.status === "ACTIVE") {
    redirect(`/app/challenges/${challenge.id}`);
  }

  redirect(buildChallengeInviteUrl(challenge.id, params.code));
}
