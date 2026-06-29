"use server";

import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { redirect } from "next/navigation";
import { createSession, destroySession, getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import {
  findValidResetToken,
  getResetTokenExpiry,
  invalidateUserResetTokens,
} from "@/lib/password-reset";

export type ActionResult = { error?: string; success?: string; redirectTo?: string };

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const username = (formData.get("username") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const personalGoal = (formData.get("personalGoal") as string)?.trim() || null;
  const inviteCode = (formData.get("inviteCode") as string)?.trim() || null;

  if (!username || !email || !password) {
    return { error: "Completa todos los campos requeridos." };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (!existing.passwordHash) {
      return { error: "Este correo ya está registrado con Google. Usa el botón de Google." };
    }
    return { error: "El usuario o correo ya está registrado." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      personalGoal,
      isNewUser: true,
    },
  });

  await createSession(user.id);

  if (inviteCode) {
    const challenge = await prisma.challenge.findUnique({
      where: { inviteCode },
      select: { id: true },
    });
    if (challenge) {
      const { buildChallengeInviteUrl } = await import("@/lib/join-requests");
      return {
        redirectTo: `${buildChallengeInviteUrl(challenge.id, inviteCode)}&welcome=1`,
      };
    }
  }

  return { redirectTo: "/app/home?welcome=1" };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const identifier = (formData.get("identifier") as string)?.trim();
  const password = formData.get("password") as string;

  if (!identifier || !password) {
    return { error: "Ingresa tu usuario o correo y contraseña." };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
    },
  });

  if (!user) {
    return { error: "Credenciales incorrectas." };
  }

  if (!user.passwordHash) {
    return { error: "Esta cuenta usa Google. Inicia sesión con el botón de Google." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Credenciales incorrectas." };
  }

  await createSession(user.id);

  const redirectParam = (formData.get("redirect") as string)?.trim();
  const inviteCode = (formData.get("inviteCode") as string)?.trim() || null;

  let redirectTo =
    redirectParam && redirectParam.startsWith("/app") ? redirectParam : "/app/home";

  if (inviteCode) {
    const challenge = await prisma.challenge.findUnique({
      where: { inviteCode },
      select: { id: true },
    });
    if (challenge) {
      const { buildChallengeInviteUrl } = await import("@/lib/join-requests");
      redirectTo = buildChallengeInviteUrl(challenge.id, inviteCode);
    }
  }

  return { redirectTo };
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  if (!email) return { error: "Ingresa tu correo electrónico." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    await invalidateUserResetTokens(user.id);
    const token = nanoid(32);
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: getResetTokenExpiry(),
      },
    });
    await sendPasswordResetEmail(user.email, token);
  }

  return {
    success:
      "Si el correo existe, recibirás instrucciones para restablecer tu contraseña.",
  };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const token = (formData.get("token") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) {
    return { error: "Enlace inválido. Solicita uno nuevo." };
  }

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const resetToken = await findValidResetToken(token);
  if (!resetToken) {
    return {
      error: "Este enlace ha expirado o no es válido. Solicita uno nuevo.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    }),
  ]);

  return {
    success: "Contraseña actualizada correctamente.",
    redirectTo: "/login?reset=success",
  };
}

export async function deleteAccountAction(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "No autenticado." };

  await prisma.user.delete({ where: { id: session.id } });
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "No autenticado." };

  const description = (formData.get("description") as string)?.trim() || null;

  await prisma.user.update({
    where: { id: session.id },
    data: { description },
  });

  return { success: "Perfil actualizado." };
}

export async function markUserOnboarded() {
  const session = await getSession();
  if (!session) return;
  await prisma.user.update({
    where: { id: session.id },
    data: { isNewUser: false },
  });
}

export async function updateUserTimezoneAction(timeZone: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "No autenticado." };

  const { isValidTimezone, resolveTimezone } = await import("@/lib/timezone");
  if (!isValidTimezone(timeZone)) {
    return { error: "Zona horaria no válida." };
  }

  await prisma.user.update({
    where: { id: session.id },
    data: { timezone: resolveTimezone(timeZone) },
  });

  return { success: "Zona horaria actualizada." };
}

export async function setFocusChallenge(challengeId: string) {
  const session = await getSession();
  if (!session) return;

  await prisma.user.update({
    where: { id: session.id },
    data: { focusChallengeId: challengeId },
  });
}
