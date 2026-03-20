"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { vendorsTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import { type UpsertVendorSchema, upsertVendorSchema } from "./schema";

export const upsertVendor = protectedAction
  .schema(upsertVendorSchema)
  .action(async ({ parsedInput }: { parsedInput: UpsertVendorSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    if (parsedInput.id) {
      const existing = await db.query.vendorsTable.findFirst({
        where: eq(vendorsTable.id, parsedInput.id),
      });
      if (!existing) throw new Error("Fornecedor não encontrado.");
      if (!canAccessClinicResource(existing.clinicId, clinicId)) {
        throw new Error("Acesso negado.");
      }
      await db
        .update(vendorsTable)
        .set({
          name: parsedInput.name,
          contactInfo: parsedInput.contactInfo ?? null,
          notes: parsedInput.notes ?? null,
        })
        .where(eq(vendorsTable.id, parsedInput.id));
    } else {
      await db.insert(vendorsTable).values({
        clinicId,
        name: parsedInput.name,
        contactInfo: parsedInput.contactInfo ?? null,
        notes: parsedInput.notes ?? null,
      });
    }

    revalidatePath(ROUTES.REGISTRY);
  });
