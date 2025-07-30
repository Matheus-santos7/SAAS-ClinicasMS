"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createSafeAction } from "next-safe-action";
import { upsertEvolutionSchema } from "./schema";

export const upsertEvolution = createSafeAction(
  upsertEvolutionSchema,
  async (data) => {
    const { userId: doctorId } = auth();
    if (!doctorId) {
      throw new Error("Acesso não autorizado.");
    }

    const { id, patientId, ...rest } = data;

    try {
      if (id) {
        // Modo de Edição
        const [updatedEvolution] = await db
          .update(evolutionTable)
          .set({
            ...rest,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(evolutionTable.id, id),
              eq(evolutionTable.doctorId, doctorId),
            ),
          ) // Garante que só o dono possa editar
          .returning();

        if (!updatedEvolution) {
          throw new Error(
            "Evolução não encontrada ou você não tem permissão para editar.",
          );
        }
      } else {
        // Modo de Criação
        await db.insert(evolutionTable).values({
          ...rest,
          patientId,
          doctorId,
        });
      }

      revalidatePath(`/patients/${patientId}`);
      return {
        success: `Evolução ${id ? "atualizada" : "criada"} com sucesso!`,
      };
    } catch (error) {
      // Simplificando o erro para o cliente
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Ocorreu um erro desconhecido." };
    }
  },
);
