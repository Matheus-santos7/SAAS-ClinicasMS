"use server";

import { eq } from "drizzle-orm";
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
  type CreatePayableExpenseSchema,
  createPayableExpenseSchema,
} from "./schema";

export const createPayableExpense = protectedAction
  .schema(createPayableExpenseSchema)
  .action(async ({ parsedInput }: { parsedInput: CreatePayableExpenseSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

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

    // Contas a pagar: somente lançamentos do tipo despesa (não receita).
    await db.insert(clinicFinancialTransactionsTable).values({
      clinicId,
      description: parsedInput.description.trim(),
      amountInCents: parsedInput.amountInCents,
      type: "expense" as const,
      expenseTypeId: parsedInput.expenseTypeId,
      vendorId: parsedInput.vendorId ?? null,
      transactionDate: new Date(),
      dueDate: parsedInput.dueDate ?? null,
      isPaid: false,
    });

    revalidatePath(ROUTES.FINANCIAL);
  });
