// src/actions/upsert-evolution/index.ts
"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { protectedAction } from "@/lib/next-safe-action";

import { upsertEvolutionSchema } from "./schema";

export const upsertEvolution = protectedAction
  .schema(upsertEvolutionSchema)
  .action(async ({ parsedInput }) => {
    const { id, patientId, doctorId, date, description, observations } =
      parsedInput;

    try {
      if (id) {
        // Modo de Edição
        const [updatedEvolution] = await db
          .update(evolutionTable)
          .set({
            patientId,
            doctorId,
            date,
            description,
            observations: observations ?? "",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(evolutionTable.id, id),
              eq(evolutionTable.doctorId, doctorId),
            ),
          )
          .returning();

        if (!updatedEvolution) {
          throw new Error(
            "Evolução não encontrada ou o médico selecionado não corresponde.",
          );
        }
      } else {
        // Modo de Criação
        await db.insert(evolutionTable).values({
          patientId,
          doctorId,
          date,
          description,
          observations: observations ?? "",
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
