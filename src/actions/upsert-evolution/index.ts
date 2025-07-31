"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
// Import the correct function from your auth module
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import { upsertEvolutionSchema } from "./schema";

export const upsertEvolution = actionClient
  .schema(upsertEvolutionSchema)
  .action(async ({ parsedInput }) => {
    const { headers } = await import("next/headers");
    const session = await auth.api.getSession({ headers: await headers() });
    const doctorId = session?.user?.id;
    if (!doctorId) {
      throw new Error("Acesso não autorizado.");
    }

    const { id, patientId, ...rest } = parsedInput;

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
          )
          .returning();

        if (!updatedEvolution) {
          throw new Error(
            "Evolução não encontrada ou você não tem permissão para editar.",
          );
        }
      } else {
        // Modo de Criação
        const { date, ...restFields } = rest;
        await db.insert(evolutionTable).values({
          ...restFields,
          patientId,
          doctorId,
          date: typeof date === "string" ? new Date(date) : date,
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
