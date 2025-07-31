"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { upsertEvolutionSchema } from "./schema";
import { headers } from "next/headers";

export const upsertEvolution = actionClient
  .schema(upsertEvolutionSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({ headers: await headers() });
    
    // Apenas verifica se há um usuário logado, sem usar o ID dele como doctorId
    if (!session?.user) {
      throw new Error("Acesso não autorizado.");
    }

    const { id, patientId, doctorId, ...rest } = parsedInput;

    try {
      if (id) {
        // Modo de Edição
        const [updatedEvolution] = await db
          .update(evolutionTable)
          .set({
            ...rest,
            doctorId, // Usa o doctorId vindo do formulário
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(evolutionTable.id, id),
              eq(evolutionTable.patientId, patientId), 
            ),
          )
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
          doctorId, // Usa o doctorId vindo do formulário
          observations: rest.observations ?? "",
        });
      }

      revalidatePath(`/patients/${patientId}`);
      return {
        success: `Evolução ${id ? "atualizada" : "criada"} com sucesso!`,
      };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Ocorreu um erro desconhecido." };
    }
  });