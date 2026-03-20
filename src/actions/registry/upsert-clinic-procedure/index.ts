"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { clinicProceduresTable } from "@/db/schema";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpsertClinicProcedureSchema,
  upsertClinicProcedureSchema,
} from "./schema";

export const upsertClinicProcedure = protectedAction
  .schema(upsertClinicProcedureSchema)
  .action(async ({ parsedInput }: { parsedInput: UpsertClinicProcedureSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    if (parsedInput.id) {
      const existing = await db.query.clinicProceduresTable.findFirst({
        where: eq(clinicProceduresTable.id, parsedInput.id),
      });
      if (!existing) {
        throw new Error("Procedimento não encontrado.");
      }
      if (!canAccessClinicResource(existing.clinicId, clinicId)) {
        throw new Error("Acesso negado.");
      }
      await db
        .update(clinicProceduresTable)
        .set({
          name: parsedInput.name,
          basePriceInCents: parsedInput.basePriceInCents,
          durationSeconds: parsedInput.durationSeconds,
          hasReturn: parsedInput.hasReturn,
        })
        .where(eq(clinicProceduresTable.id, parsedInput.id));
    } else {
      await db.insert(clinicProceduresTable).values({
        clinicId,
        name: parsedInput.name,
        basePriceInCents: parsedInput.basePriceInCents,
        durationSeconds: parsedInput.durationSeconds,
        hasReturn: parsedInput.hasReturn,
      });
    }

    revalidatePath(ROUTES.REGISTRY);
  });
