"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { appointmentsTable, paymentsTable } from "@/db/schema";
import { recalculateAppointmentPaidFromPayments } from "@/helpers/appointment-payments";
import { canAccessClinicResource } from "@/helpers/permission";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type UpdateReceivableFinancialSchema,
  updateReceivableFinancialSchema,
} from "./schema";

export const updateReceivableFinancial = protectedAction
  .schema(updateReceivableFinancialSchema)
  .action(
    async ({ parsedInput }: { parsedInput: UpdateReceivableFinancialSchema }) => {
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
        throw new Error(
          "Só é possível editar valores financeiros de atendimentos concluídos.",
        );
      }

      const [paidRow] = await db
        .select({
          sum: sql<number>`coalesce(sum(${paymentsTable.amountInCents}), 0)::bigint`,
        })
        .from(paymentsTable)
        .where(
          and(
            eq(paymentsTable.appointmentId, appointment.id),
            isNull(paymentsTable.deletedAt),
          ),
        );

      const paidSum = Number(paidRow?.sum ?? 0);
      if (paidSum > parsedInput.appointmentPriceInCents) {
        throw new Error(
          "O valor total não pode ser menor que a soma dos pagamentos já registrados. Ajuste ou exclua lançamentos na gestão de pagamentos.",
        );
      }

      await db
        .update(appointmentsTable)
        .set({
          appointmentPriceInCents: parsedInput.appointmentPriceInCents,
        })
        .where(
          and(
            eq(appointmentsTable.id, appointment.id),
            eq(appointmentsTable.clinicId, clinicId),
            eq(appointmentsTable.status, "completed"),
          ),
        );

      await recalculateAppointmentPaidFromPayments(appointment.id);

      revalidatePath(ROUTES.FINANCIAL);
      revalidatePath(ROUTES.APPOINTMENTS);
      revalidatePath(ROUTES.DASHBOARD);
    },
  );
