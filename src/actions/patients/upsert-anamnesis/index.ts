// src/actions/upsert-anamnesis/index.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { patientsAnamnesisTable, patientsTable } from "@/db/schema";
import {
  getClinicIdOrThrow,
  getSessionOrThrow,
  validateClinicResourceAccess,
} from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";

import { upsertAnamnesisSchema } from "./schema";

export const upsertAnamnesis = protectedAction
  .schema(upsertAnamnesisSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const { id, patientId, doctorId, ...updateData } = parsedInput;

    try {
      // VALIDAÇÃO DE SEGURANÇA: Verifica se o paciente pertence à clínica do usuário
      const patient = await db.query.patientsTable.findFirst({
        where: eq(patientsTable.id, patientId),
        columns: {
          clinicId: true,
        },
      });

      if (!patient) {
        return { error: "Paciente não encontrado" };
      }

      validateClinicResourceAccess(patient.clinicId, clinicId);

      // Se estamos editando (id existe), verifica se a anamnese existe e pertence à clínica
      if (id) {
        const existingAnamnesis =
          await db.query.patientsAnamnesisTable.findFirst({
            where: eq(patientsAnamnesisTable.id, id),
            with: {
              patient: {
                columns: {
                  clinicId: true,
                },
              },
            },
          });

        if (existingAnamnesis) {
          validateClinicResourceAccess(
            existingAnamnesis.patient.clinicId,
            clinicId,
          );
        }
      }

      await db
        .insert(patientsAnamnesisTable)
        .values({ id, patientId, doctorId, ...updateData })
        .onConflictDoUpdate({
          target: [patientsAnamnesisTable.id],
          set: { ...updateData, updatedAt: new Date() },
        });

      revalidatePath(`/patients/${parsedInput.patientId}`);
      return { success: "Anamnese salva com sucesso." };
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
      return { error: "Ocorreu um erro desconhecido." };
    }
  });
