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
  type DeleteReceivablePaymentSchema,
  deleteReceivablePaymentSchema,
} from "./schema";

function appendFinanceNote(
  current: string | null | undefined,
  line: string,
): string {
  const base = current?.trim() ?? "";
  return base ? `${base}\n\n${line}` : line;
}

export const deleteReceivablePayment = protectedAction
  .schema(deleteReceivablePaymentSchema)
  .action(async ({ parsedInput }: { parsedInput: DeleteReceivablePaymentSchema }) => {
    const session = await getSessionOrThrow();
    const clinicId = getClinicIdOrThrow(session);

    const payment = await db.query.paymentsTable.findFirst({
      where: and(
        eq(paymentsTable.id, parsedInput.paymentId),
        isNull(paymentsTable.deletedAt),
      ),
    });

    if (!payment?.appointmentId) {
      throw new Error("Pagamento não encontrado.");
    }
    if (!canAccessClinicResource(payment.clinicId, clinicId)) {
      throw new Error("Acesso negado.");
    }

    const appointment = await db.query.appointmentsTable.findFirst({
      where: and(
        eq(appointmentsTable.id, payment.appointmentId),
        isNull(appointmentsTable.deletedAt),
      ),
    });

    if (!appointment || appointment.status !== "completed") {
      throw new Error("Agendamento inválido.");
    }

    const note = `[Exclusão de pagamento] ${parsedInput.observation}`;

    await db.transaction(async (tx) => {
      await tx
        .update(paymentsTable)
        .set({ deletedAt: new Date() })
        .where(eq(paymentsTable.id, payment.id));

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
  });
