"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createSafeAction } from "next-safe-action";
import { deleteEvolutionSchema } from "./schema";

export const deleteEvolution = createSafeAction(
  deleteEvolutionSchema,
  async ({ id }) => {
    const { userId: doctorId } = auth();
    if (!doctorId) {
      throw new Error("Acesso não autorizado.");
    }

    try {
      // Primeiro, pegamos a evolução para obter o patientId para revalidação
      const [evolution] = await db
        .select({ patientId: evolutionTable.patientId })
        .from(evolutionTable)
        .where(eq(evolutionTable.id, id));

      if (!evolution) {
        throw new Error("Registro de evolução não encontrado.");
      }

      // Deleta o registro
      await db
        .delete(evolutionTable)
        .where(
          and(eq(evolutionTable.id, id), eq(evolutionTable.doctorId, doctorId)),
        );

      revalidatePath(`/patients/${evolution.patientId}`);
      return { success: "Evolução deletada com sucesso!" };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Não foi possível deletar a evolução." };
    }
  },
);
