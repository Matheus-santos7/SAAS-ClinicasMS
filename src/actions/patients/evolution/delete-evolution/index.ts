"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { evolutionTable } from "@/db/schema";
import {
  getClinicIdOrThrow,
  getSessionOrThrow,
  validateClinicResourceAccess,
} from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";

export const deleteEvolution = protectedAction
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    // 1. Busca a evolução E o paciente associado para validar o clinicId
    const evolution = await db.query.evolutionTable.findFirst({
      where: eq(evolutionTable.id, parsedInput.id),
      with: {
        patient: {
          columns: {
            clinicId: true,
          },
        },
      },
    });

    if (!evolution) {
      return { error: "Evolução não encontrada" };
    }

    // 2. VALIDAÇÃO DE SEGURANÇA: Verifica se o recurso pertence à clínica do usuário
    validateClinicResourceAccess(evolution.patient.clinicId, clinicId);

    // 3. Agora é seguro deletar - sabemos que o recurso pertence à clínica do usuário
    await db
      .delete(evolutionTable)
      .where(eq(evolutionTable.id, parsedInput.id));

    revalidatePath(`/patients/${evolution.patientId}`);
    return { success: "Evolução deletada com sucesso!" };
  });
