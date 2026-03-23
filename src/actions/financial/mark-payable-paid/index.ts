"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicFinancialTransactionsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { type MarkPayablePaidSchema, markPayablePaidSchema } from "./schema";

export const markPayablePaid = protectedAction
  .schema(markPayablePaidSchema)
  .action(async ({ parsedInput }: { parsedInput: MarkPayablePaidSchema }) => {
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
    if (row.isPaid) {
      throw new Error("Esta despesa já está marcada como paga.");
    }

    await db
      .update(clinicFinancialTransactionsTable)
      .set({ isPaid: true })
      .where(eq(clinicFinancialTransactionsTable.id, row.id));

    revalidatePath(ROUTES.FINANCIAL);
  });
