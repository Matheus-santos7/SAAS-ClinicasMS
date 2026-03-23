import { and, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  clinicFinancialTransactionsTable,
  paymentsTable,
} from "@/db/schema";

export type FinancialSummary = {
  /**
   * Valores efetivamente recebidos em consultas concluídas (situação quitado ou
   * parcial). O que ainda está em aberto na consulta não entra.
   */
  faturamentoInCents: number;
  /** Total em aberto a pagar (despesas não pagas) */
  payableOpenInCents: number;
  /** Faturamento − contas a pagar (em aberto) */
  saldoConsultorioInCents: number;
};

export async function getFinancialSummary(
  clinicId: string,
): Promise<FinancialSummary> {
  const [faturamentoRow] = await db
    .select({
      total: sql<number>`coalesce(sum(coalesce(${appointmentsTable.paidAmountInCents}, 0)), 0)::bigint`,
    })
    .from(appointmentsTable)
    .where(
      and(
        eq(appointmentsTable.clinicId, clinicId),
        isNull(appointmentsTable.deletedAt),
        eq(appointmentsTable.status, "completed"),
        sql`coalesce(${appointmentsTable.paidAmountInCents}, 0) > 0`,
      ),
    );

  const [payableRow] = await db
    .select({
      total: sql<number>`coalesce(sum(${clinicFinancialTransactionsTable.amountInCents}), 0)::bigint`,
    })
    .from(clinicFinancialTransactionsTable)
    .where(
      and(
        eq(clinicFinancialTransactionsTable.clinicId, clinicId),
        isNull(clinicFinancialTransactionsTable.deletedAt),
        eq(clinicFinancialTransactionsTable.type, "expense"),
        eq(clinicFinancialTransactionsTable.isPaid, false),
      ),
    );

  const faturamentoInCents = Number(faturamentoRow?.total ?? 0);
  const payableOpenInCents = Number(payableRow?.total ?? 0);
  const saldoConsultorioInCents = faturamentoInCents - payableOpenInCents;

  return {
    faturamentoInCents,
    payableOpenInCents,
    saldoConsultorioInCents,
  };
}

export type ReceivablePaymentRow = {
  id: string;
  amountInCents: number;
  paymentMethod: string;
  paymentDate: Date;
  notes: string | null;
};

export type ReceivableRow = {
  id: string;
  date: Date;
  patientName: string;
  doctorName: string;
  appointmentPriceInCents: number;
  /** Soma dos lançamentos em `payments` (fonte de verdade). */
  paidAmountInCents: number;
  remainingInCents: number;
  payments: ReceivablePaymentRow[];
};

/** Agendamentos concluídos na agenda (mesmo critério da agenda: status `completed`). */
export async function getReceivables(clinicId: string): Promise<ReceivableRow[]> {
  const rows = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.clinicId, clinicId),
      isNull(appointmentsTable.deletedAt),
      eq(appointmentsTable.status, "completed"),
    ),
    orderBy: (a, { desc }) => [desc(a.date)],
    with: {
      patient: { columns: { name: true } },
      doctor: { columns: { name: true } },
      payments: {
        where: isNull(paymentsTable.deletedAt),
        orderBy: (p, { desc }) => [desc(p.paymentDate)],
        columns: {
          id: true,
          amountInCents: true,
          paymentMethod: true,
          paymentDate: true,
          notes: true,
        },
      },
    },
  });

  return rows.map((a) => {
    const paid = a.payments.reduce((s, p) => s + p.amountInCents, 0);
    const remaining = a.appointmentPriceInCents - paid;
    return {
      id: a.id,
      date: a.date,
      patientName: a.patient.name,
      doctorName: a.doctor.name,
      appointmentPriceInCents: a.appointmentPriceInCents,
      paidAmountInCents: paid,
      remainingInCents: remaining,
      payments: a.payments.map((p) => ({
        id: p.id,
        amountInCents: p.amountInCents,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        notes: p.notes,
      })),
    };
  });
}

export type PayableRow = {
  id: string;
  description: string;
  amountInCents: number;
  dueDate: Date | null;
  transactionDate: Date;
  /** Nome do tipo de despesa (cadastro) ou, em lançamentos legados, categoria antiga. */
  categoryName: string;
  vendorName: string | null;
  expenseTypeId: string | null;
  vendorId: string | null;
  isPaid: boolean;
};

async function fetchPayableRows(
  clinicId: string,
  isPaid: boolean,
): Promise<PayableRow[]> {
  const rows = await db.query.clinicFinancialTransactionsTable.findMany({
    where: and(
      eq(clinicFinancialTransactionsTable.clinicId, clinicId),
      isNull(clinicFinancialTransactionsTable.deletedAt),
      eq(clinicFinancialTransactionsTable.type, "expense"),
      eq(clinicFinancialTransactionsTable.isPaid, isPaid),
    ),
    orderBy: (t, { desc }) => [desc(t.transactionDate)],
    with: {
      expenseType: { columns: { name: true } },
      category: { columns: { name: true } },
      vendor: { columns: { name: true } },
    },
  });

  return rows.map((t) => ({
    id: t.id,
    description: t.description,
    amountInCents: t.amountInCents,
    dueDate: t.dueDate,
    transactionDate: t.transactionDate,
    categoryName:
      t.expenseType?.name ?? t.category?.name ?? "—",
    vendorName: t.vendor?.name ?? null,
    expenseTypeId: t.expenseTypeId ?? null,
    vendorId: t.vendorId ?? null,
    isPaid: t.isPaid,
  }));
}

/** Despesas em contas a pagar ainda não quitadas. */
export async function getPayablesOpen(clinicId: string): Promise<PayableRow[]> {
  return fetchPayableRows(clinicId, false);
}

/** Despesas já marcadas como pagas. */
export async function getPayablesPaid(clinicId: string): Promise<PayableRow[]> {
  return fetchPayableRows(clinicId, true);
}
