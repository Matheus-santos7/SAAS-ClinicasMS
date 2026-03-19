"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import {
  appointmentsTable,
  clinicFinancialTransactionsTable,
  paymentsTable,
  transactionCategoriesTable,
} from "@/db/schema";
import { getClinicIdOrThrow, getSessionOrThrow } from "@/helpers/session";
import { protectedAction } from "@/lib/next-safe-action";
import { ROUTES } from "@/lib/routes";

import {
  type RegisterAppointmentPaymentSchema,
  registerAppointmentPaymentSchema,
} from "./schema";

export const registerAppointmentPayment = protectedAction
  .schema(registerAppointmentPaymentSchema)
  .action(
    async ({
      parsedInput,
    }: {
      parsedInput: RegisterAppointmentPaymentSchema;
    }) => {
      const session = await getSessionOrThrow();
      const clinicId = getClinicIdOrThrow(session);

      const appointment = await db.query.appointmentsTable.findFirst({
        where: and(
          eq(appointmentsTable.id, parsedInput.appointmentId),
          eq(appointmentsTable.clinicId, clinicId),
        ),
        with: {
          patient: true,
          doctor: true,
        },
      });

      if (!appointment) {
        throw new Error("Agendamento não encontrado.");
      }

      // Garante categoria de receita para consultas
      const [category] = await db
        .select()
        .from(transactionCategoriesTable)
        .where(
          and(
            eq(transactionCategoriesTable.clinicId, clinicId),
            eq(transactionCategoriesTable.name, "Receita de Consulta"),
            eq(transactionCategoriesTable.type, "income"),
          ),
        )
        .limit(1);

      let categoryId = category?.id;

      if (!categoryId) {
        const [insertedCategory] = await db
          .insert(transactionCategoriesTable)
          .values({
            clinicId,
            name: "Receita de Consulta",
            type: "income",
          })
          .returning();

        categoryId = insertedCategory.id;
      }

      // Cria registro na tabela de pagamentos, vinculado ao agendamento
      const [payment] = await db
        .insert(paymentsTable)
        .values({
          appointmentId: appointment.id,
          clinicId,
          amountInCents: parsedInput.amountInCents,
          paymentMethod: parsedInput.method,
          paymentDate: parsedInput.paymentDate,
          notes: parsedInput.notes ?? undefined,
        })
        .returning();

      await db.insert(clinicFinancialTransactionsTable).values({
        clinicId,
        amountInCents: parsedInput.amountInCents,
        type: "income",
        categoryId,
        description: `Pagamento consulta - ${appointment.patient.name}`,
        transactionDate: parsedInput.paymentDate,
        paymentId: payment.id,
      });

      // Atualiza o agendamento com o valor pago (contas a receber liquidada)
      await db
        .update(appointmentsTable)
        .set({ paidAmountInCents: parsedInput.amountInCents })
        .where(
          and(
            eq(appointmentsTable.id, parsedInput.appointmentId),
            eq(appointmentsTable.clinicId, clinicId),
          ),
        );

      revalidatePath(ROUTES.FINANCIAL);

      return { success: true as const };
    },
  );

