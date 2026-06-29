import { prisma } from "@/lib/db";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60; // 1 hour

export function getResetTokenExpiry(): Date {
  return new Date(Date.now() + RESET_TOKEN_TTL_MS);
}

export async function findValidResetToken(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: {
      user: {
        select: { id: true, email: true, passwordHash: true },
      },
    },
  });

  if (!resetToken) return null;
  if (resetToken.expiresAt < new Date()) return null;
  if (!resetToken.user.passwordHash) return null;

  return resetToken;
}

export async function invalidateUserResetTokens(userId: string) {
  await prisma.passwordResetToken.deleteMany({ where: { userId } });
}
