"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { evolutionTable, patientsTable } from "@/db/schema";
import {
  getClinicIdOrThrow,
  getSessionOrThrow,
  validateClinicResourceAccess,
} from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";

import { upsertEvolutionSchema } from "./schema";

export const upsertEvolution = protectedAction
  .schema(upsertEvolutionSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const { id, patientId, doctorId, date, description, observations } =
      parsedInput;

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

      if (id) {
        // Modo de Edição - verifica se a evolução existe e pertence à clínica
        const existingEvolution = await db.query.evolutionTable.findFirst({
          where: eq(evolutionTable.id, id),
          with: {
            patient: {
              columns: {
                clinicId: true,
              },
            },
          },
        });

        if (!existingEvolution) {
          return { error: "Evolução não encontrada" };
        }

        validateClinicResourceAccess(
          existingEvolution.patient.clinicId,
          clinicId,
        );

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
          return {
            error: "Erro ao atualizar evolução ou médico não corresponde",
          };
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
