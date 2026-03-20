"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { expenseTypesTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

export const deleteExpenseType = protectedAction
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const row = await db.query.expenseTypesTable.findFirst({
      where: eq(expenseTypesTable.id, parsedInput.id),
    });
    if (!row) throw new Error("Registro não encontrado.");
    if (!canAccessClinicResource(row.clinicId, clinicId)) {
      throw new Error("Acesso negado.");
    }

    await db
      .update(expenseTypesTable)
      .set({ deletedAt: new Date() })
      .where(eq(expenseTypesTable.id, parsedInput.id));

    revalidatePath(ROUTES.REGISTRY);
  });
