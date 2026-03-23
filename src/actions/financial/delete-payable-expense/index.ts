"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicFinancialTransactionsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type DeletePayableExpenseSchema,
  deletePayableExpenseSchema,
} from "./schema";

export const deletePayableExpense = protectedAction
  .schema(deletePayableExpenseSchema)
  .action(async ({ parsedInput }: { parsedInput: DeletePayableExpenseSchema }) => {
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

    await db
      .update(clinicFinancialTransactionsTable)
      .set({ deletedAt: new Date() })
      .where(eq(clinicFinancialTransactionsTable.id, row.id));

    revalidatePath(ROUTES.FINANCIAL);
  });
