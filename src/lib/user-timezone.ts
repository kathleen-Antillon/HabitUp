import { prisma } from "@/lib/db";
import { resolveTimezone } from "@/lib/timezone";

export async function getUserTimezone(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true },
  });
  return resolveTimezone(user?.timezone);
}
