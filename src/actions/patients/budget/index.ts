"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { budgetItemsTable, budgetsTable, patientsTable } from "@/db/schema";
import {
  getClinicIdOrThrow,
  getSessionOrThrow,
  validateClinicResourceAccess,
} from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";

import {
  budgetDeleteSchema,
  budgetSchema,
  budgetToTreatmentSchema,
} from "./schema";

export const upsertBudget = protectedAction
  .schema(budgetSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const userClinicId = getClinicIdOrThrow(session);

    const {
      id,
      patientId,
      doctorId,
      clinicId,
      procedures,
      total,
      observations,
    } = parsedInput;

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

    validateClinicResourceAccess(patient.clinicId, userClinicId);

    // Se estamos editando, valida se o orçamento existente pertence à clínica
    if (id) {
      const existingBudget = await db.query.budgetsTable.findFirst({
        where: eq(budgetsTable.id, id),
        with: {
          patient: {
            columns: {
              clinicId: true,
            },
          },
        },
      });

      if (existingBudget) {
        validateClinicResourceAccess(
          existingBudget.patient.clinicId,
          userClinicId,
        );
      }
    }

    // Calcula total em centavos
    const totalAmountInCents = Math.round(total * 100);
    let budgetId: string;
    if (id) {
      await db
        .update(budgetsTable)
        .set({
          patientId,
          doctorId,
          clinicId,
          totalAmountInCents,
          notes: observations,
        })
        .where(eq(budgetsTable.id, id));
      // Remove itens antigos
      await db
        .delete(budgetItemsTable)
        .where(eq(budgetItemsTable.budgetId, id));
      budgetId = id;
    } else {
      const [budget] = await db
        .insert(budgetsTable)
        .values({
          patientId,
          doctorId,
          clinicId,
          totalAmountInCents,
          notes: observations,
        })
        .returning();
      parsedInput.id = budget.id;
      budgetId = budget.id;
    }
    // Insere itens do orçamento
    for (const item of procedures) {
      await db.insert(budgetItemsTable).values({
        budgetId: budgetId,
        procedureName: item.name,
        quantity: item.quantity ?? 1,
        priceInCents: Math.round(item.value * 100),
      });
    }
    revalidatePath(`/patients/${patientId}`);
    return { success: "Orçamento salvo!" };
  });

export const deleteBudget = protectedAction
  .schema(budgetDeleteSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const { id } = parsedInput;

    // VALIDAÇÃO DE SEGURANÇA: Busca o orçamento com o paciente para validar clinicId
    const budget = await db.query.budgetsTable.findFirst({
      where: eq(budgetsTable.id, id),
      with: {
        patient: {
          columns: {
            clinicId: true,
          },
        },
      },
    });

    if (!budget) {
      return { error: "Orçamento não encontrado" };
    }

    validateClinicResourceAccess(budget.patient.clinicId, clinicId);

    await db.delete(budgetsTable).where(eq(budgetsTable.id, id));
    revalidatePath(`/patients/${budget.patientId}`);
    return { success: "Orçamento removido!" };
  });

export const budgetToTreatment = protectedAction
  .schema(budgetToTreatmentSchema)
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const { id } = parsedInput;

    // VALIDAÇÃO DE SEGURANÇA: Busca o orçamento com o paciente para validar clinicId
    const budget = await db.query.budgetsTable.findFirst({
      where: eq(budgetsTable.id, id),
      with: {
        patient: {
          columns: {
            clinicId: true,
          },
        },
      },
    });

    if (!budget) {
      return { error: "Orçamento não encontrado" };
    }

    validateClinicResourceAccess(budget.patient.clinicId, clinicId);

    // Aqui você pode criar o tratamento usando os dados do orçamento e dos itens
    // await db.insert(treatmentsTable).values({ ... }); // Adapte conforme seu modelo de tratamento
    await db
      .update(budgetsTable)
      .set({ status: "approved" })
      .where(eq(budgetsTable.id, id));
    revalidatePath(`/patients/${budget.patientId}`);
    return { success: "Orçamento convertido em tratamento!" };
  });
