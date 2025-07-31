"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { z } from "zod";

export const deleteEvolution = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      throw new Error("Não autorizado");
    }
    // Busca evolução
    const evolution = await db.query.evolutionTable.findFirst({
      where: eq(evolutionTable.id, parsedInput.id),
    });
    if (!evolution) {
      throw new Error("Evolução não encontrada");
    }
    if (evolution.doctorId !== session.user.id) {
      throw new Error("Acesso negado");
    }
    await db
      .delete(evolutionTable)
      .where(eq(evolutionTable.id, parsedInput.id));
    revalidatePath(`/patients/${evolution.patientId}`);
    return { success: "Evolução deletada com sucesso!" };
  });
