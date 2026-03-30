"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  clinicFinancialTransactionsTable,
  expenseTypesTable,
  vendorsTable,
} from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpdatePayableExpenseSchema,
  updatePayableExpenseSchema,
} from "./schema";

export const updatePayableExpense = protectedAction
  .schema(updatePayableExpenseSchema)
  .action(async ({ parsedInput }: { parsedInput: UpdatePayableExpenseSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const row = await db.query.clinicFinancialTransactionsTable.findFirst({
      where: and(
        eq(clinicFinancialTransactionsTable.id, parsedInput.transactionId),
        isNull(clinicFinancialTransactionsTable.deletedAt),
      ),
    });

    if (!row) {
      throw new Error("Lançamento não encontrado.");
    }
    if (!canAccessClinicResource(row.clinicId, clinicId)) {
      throw new Error("Acesso negado.");
    }
    if (row.type !== "expense") {
      throw new Error("Operação inválida.");
    }

    const expenseType = await db.query.expenseTypesTable.findFirst({
      where: eq(expenseTypesTable.id, parsedInput.expenseTypeId),
    });

    if (!expenseType) {
      throw new Error("Tipo de despesa não encontrado.");
    }
    if (!canAccessClinicResource(expenseType.clinicId, clinicId)) {
      throw new Error("Acesso negado.");
    }
    if (expenseType.deletedAt) {
      throw new Error("Tipo de despesa inválido.");
    }

    if (parsedInput.vendorId) {
      const vendor = await db.query.vendorsTable.findFirst({
        where: eq(vendorsTable.id, parsedInput.vendorId),
      });
      if (!vendor) {
        throw new Error("Fornecedor não encontrado.");
      }
      if (!canAccessClinicResource(vendor.clinicId, clinicId)) {
        throw new Error("Acesso negado.");
      }
    }

    await db
      .update(clinicFinancialTransactionsTable)
      .set({
        description: parsedInput.description.trim(),
        amountInCents: parsedInput.amountInCents,
        expenseTypeId: parsedInput.expenseTypeId,
        vendorId: parsedInput.vendorId ?? null,
        dueDate: parsedInput.dueDate ?? null,
      })
      .where(eq(clinicFinancialTransactionsTable.id, row.id));

    revalidatePath(ROUTES.FINANCIAL);
  });
