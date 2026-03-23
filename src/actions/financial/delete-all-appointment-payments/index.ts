"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, paymentsTable } from "@/db/schema";
import { recalculateAppointmentPaidFromPayments } from "@/helpers/appointment-payments";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type DeleteAllAppointmentPaymentsSchema,
  deleteAllAppointmentPaymentsSchema,
} from "./schema";

function appendFinanceNote(
  current: string | null | undefined,
  line: string,
): string {
  const base = current?.trim() ?? "";
  return base ? `${base}\n\n${line}` : line;
}

export const deleteAllAppointmentPayments = protectedAction
  .schema(deleteAllAppointmentPaymentsSchema)
  .action(
    async ({ parsedInput }: { parsedInput: DeleteAllAppointmentPaymentsSchema }) => {
      const session = await getSessionOrThrow();
      const clinicId = getClinicIdOrThrow(session);

      const appointment = await db.query.appointmentsTable.findFirst({
        where: and(
          eq(appointmentsTable.id, parsedInput.appointmentId),
          isNull(appointmentsTable.deletedAt),
        ),
      });

      if (!appointment) {
        throw new Error("Agendamento não encontrado.");
      }
      if (!canAccessClinicResource(appointment.clinicId, clinicId)) {
        throw new Error("Acesso negado.");
      }
      if (appointment.status !== "completed") {
        throw new Error("Somente atendimentos concluídos.");
      }

      const note = `[Exclusão de todos os pagamentos] ${parsedInput.observation}`;

      await db.transaction(async (tx) => {
        await tx
          .update(paymentsTable)
          .set({ deletedAt: new Date() })
          .where(
            and(
              eq(paymentsTable.appointmentId, appointment.id),
              isNull(paymentsTable.deletedAt),
            ),
          );

        await tx
          .update(appointmentsTable)
          .set({
            observations: appendFinanceNote(appointment.observations, note),
          })
          .where(eq(appointmentsTable.id, appointment.id));
      });

      await recalculateAppointmentPaidFromPayments(appointment.id);

      revalidatePath(ROUTES.FINANCIAL);
      revalidatePath(ROUTES.APPOINTMENTS);
      revalidatePath(ROUTES.DASHBOARD);
    },
  );
