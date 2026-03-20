"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { expenseTypesTable, vendorsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpsertExpenseTypeSchema,
  upsertExpenseTypeSchema,
} from "./schema";

export const upsertExpenseType = protectedAction
  .schema(upsertExpenseTypeSchema)
  .action(async ({ parsedInput }: { parsedInput: UpsertExpenseTypeSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    if (parsedInput.vendorId) {
      const vendor = await db.query.vendorsTable.findFirst({
        where: eq(vendorsTable.id, parsedInput.vendorId),
      });
      if (!vendor || !canAccessClinicResource(vendor.clinicId, clinicId)) {
        throw new Error("Fornecedor inválido.");
      }
    }

    if (parsedInput.id) {
      const existing = await db.query.expenseTypesTable.findFirst({
        where: eq(expenseTypesTable.id, parsedInput.id),
      });
      if (!existing) throw new Error("Tipo de despesa não encontrado.");
      if (!canAccessClinicResource(existing.clinicId, clinicId)) {
        throw new Error("Acesso negado.");
      }
      await db
        .update(expenseTypesTable)
        .set({
          name: parsedInput.name,
          recurrenceType: parsedInput.recurrenceType,
          notes: parsedInput.notes ?? null,
          vendorId: parsedInput.vendorId ?? null,
        })
        .where(eq(expenseTypesTable.id, parsedInput.id));
    } else {
      await db.insert(expenseTypesTable).values({
        clinicId,
        name: parsedInput.name,
        recurrenceType: parsedInput.recurrenceType,
        notes: parsedInput.notes ?? null,
        vendorId: parsedInput.vendorId ?? null,
      });
    }

    revalidatePath(ROUTES.REGISTRY);
  });
