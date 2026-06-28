"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import type { ActionResult } from "./auth";

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  await markNotificationRead(notificationId, session.id);
  revalidatePath("/app/notifications");
  revalidatePath("/app/home");
  revalidatePath("/app/challenges");
  revalidatePath("/app/penitencias");
  revalidatePath("/app/profile");

  return { success: "Notificación marcada como leída." };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  await markAllNotificationsRead(session.id);
  revalidatePath("/app/notifications");
  revalidatePath("/app/home");
  revalidatePath("/app/challenges");
  revalidatePath("/app/penitencias");
  revalidatePath("/app/profile");

  return { success: "Notificaciones marcadas como leídas." };
}
