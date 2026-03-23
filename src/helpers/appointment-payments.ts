import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, paymentsTable } from "@/db/schema";

/** Soma dos pagamentos ativos (não excluídos) do agendamento. */
export async function getAppointmentPaidSumFromPayments(
  appointmentId: string,
): Promise<number> {
  const [row] = await db
    .select({
      sum: sql<number>`coalesce(sum(${paymentsTable.amountInCents}), 0)::bigint`,
    })
    .from(paymentsTable)
    .where(
      and(
        eq(paymentsTable.appointmentId, appointmentId),
        isNull(paymentsTable.deletedAt),
      ),
    );

  return Number(row?.sum ?? 0);
}

/** Atualiza `paid_amount_in_cents` do agendamento com a soma dos pagamentos ativos. */
export async function recalculateAppointmentPaidFromPayments(
  appointmentId: string,
) {
  const sum = await getAppointmentPaidSumFromPayments(appointmentId);

  await db
    .update(appointmentsTable)
    .set({ paidAmountInCents: sum })
    .where(eq(appointmentsTable.id, appointmentId));
}
