"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

export const deleteEvolution = actionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    // Busca evolução
    const evolution = await db.query.evolutionTable.findFirst({
      where: eq(evolutionTable.id, parsedInput.id),
    });
    if (!evolution) {
      throw new Error("Evolução não encontrada");
    }
    // Permite deletar sem checar usuário logado, pois secretaria/admin pode remover
    await db
      .delete(evolutionTable)
      .where(eq(evolutionTable.id, parsedInput.id));
    revalidatePath(`/patients/${evolution.patientId}`);
    return { success: "Evolução deletada com sucesso!" };
  });
