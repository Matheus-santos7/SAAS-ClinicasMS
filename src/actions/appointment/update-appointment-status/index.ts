"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpdateAppointmentStatusSchema,
  updateAppointmentStatusSchema,
} from "./schema";

export const updateAppointmentStatus = protectedAction
  .schema(updateAppointmentStatusSchema)
  .action(
    async ({
      parsedInput,
    }: {
      parsedInput: UpdateAppointmentStatusSchema;
    }) => {
      const session = await getSessionOrThrow();
      const clinicId = getClinicIdOrThrow(session);

      await db
        .update(appointmentsTable)
        .set({ status: parsedInput.status })
        .where(
          and(
            eq(appointmentsTable.id, parsedInput.id),
            eq(appointmentsTable.clinicId, clinicId),
          ),
        );

      revalidatePath(ROUTES.APPOINTMENTS);
      revalidatePath(ROUTES.DASHBOARD);

      return { success: true as const };
    },
  );

