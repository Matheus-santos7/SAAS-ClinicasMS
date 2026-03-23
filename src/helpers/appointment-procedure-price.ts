import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

import { getAppointmentPaidSumFromPayments } from "./appointment-payments";

/**
 * Ao concluir, garante que o total do agendamento não fique abaixo do já pago
 * (ex.: pagamentos antes de ajuste manual do total).
 */
export async function applyProcedurePriceWhenAppointmentCompletes(
  appointmentId: string,
  clinicId: string,
): Promise<void> {
  const appointment = await db.query.appointmentsTable.findFirst({
    where: and(
      eq(appointmentsTable.id, appointmentId),
      eq(appointmentsTable.clinicId, clinicId),
      isNull(appointmentsTable.deletedAt),
    ),
  });

  if (!appointment) return;

  const paidSum = await getAppointmentPaidSumFromPayments(appointmentId);
  const target = Math.max(appointment.appointmentPriceInCents, paidSum);
  if (target === appointment.appointmentPriceInCents) return;

  await db
    .update(appointmentsTable)
    .set({ appointmentPriceInCents: target })
    .where(eq(appointmentsTable.id, appointmentId));
}
