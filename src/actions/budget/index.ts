"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { budgetItemsTable, budgetsTable } from "@/db/schema";
import { actionClient } from "@/lib/next-safe-action";

import {
  budgetDeleteSchema,
  budgetSchema,
  budgetToTreatmentSchema,
} from "./schema";

export const upsertBudget = actionClient
  .schema(budgetSchema)
  .action(async ({ parsedInput }) => {
    const {
      id,
      patientId,
      doctorId,
      clinicId,
      procedures,
      total,
      observations,
    } = parsedInput;
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

export const deleteBudget = actionClient
  .schema(budgetDeleteSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    const budget = await db.query.budgetsTable.findFirst({
      where: eq(budgetsTable.id, id),
    });
    if (!budget) throw new Error("Orçamento não encontrado");
    await db.delete(budgetsTable).where(eq(budgetsTable.id, id));
    revalidatePath(`/patients/${budget.patientId}`);
    return { success: "Orçamento removido!" };
  });

export const budgetToTreatment = actionClient
  .schema(budgetToTreatmentSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;
    const budget = await db.query.budgetsTable.findFirst({
      where: eq(budgetsTable.id, id),
    });
    if (!budget) throw new Error("Orçamento não encontrado");
    // Aqui você pode criar o tratamento usando os dados do orçamento e dos itens
    // await db.insert(treatmentsTable).values({ ... }); // Adapte conforme seu modelo de tratamento
    await db
      .update(budgetsTable)
      .set({ status: "approved" })
      .where(eq(budgetsTable.id, id));
    revalidatePath(`/patients/${budget.patientId}`);
    return { success: "Orçamento convertido em tratamento!" };
  });
