"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ActionResult } from "./auth";

export async function completePenitenciaAction(penitenciaId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { error: "Debes iniciar sesión." };

  const penitencia = await prisma.penitencia.findUnique({
    where: { id: penitenciaId },
  });

  if (!penitencia) return { error: "Penitencia no encontrada." };
  if (penitencia.userId !== session.id) {
    return { error: "No puedes cumplir penitencias de otro usuario." };
  }
  if (penitencia.status === "COMPLETED") {
    return { error: "Esta penitencia ya fue cumplida." };
  }

  await prisma.penitencia.update({
    where: { id: penitenciaId },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  revalidatePath("/app/penitencias");
  revalidatePath("/app/home");

  return { success: "Penitencia marcada como cumplida." };
}
