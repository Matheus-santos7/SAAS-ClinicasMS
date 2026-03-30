import dayjs from "dayjs";
import { and, count, desc, eq, gte, isNull, lte, sql, sum } from "drizzle-orm";

import { db } from "@/db";
import {
  appointmentsTable,
  clinicFinancialTransactionsTable,
  clinicProceduresTable,
  doctorsTable,
  patientsTable,
  vendorsTable,
} from "@/db/schema";

import { getTodayAppointmentsWithDayjs } from "./appointments";

interface Params {
  from: string;
  to: string;
  session: {
    user: {
      clinic: {
        id: string;
      };
    };
  };
}

interface DailyAppointmentResult {
  date: string;
  appointments: string;
  revenue: string;
}

export const getDashboard = async ({ from, to, session }: Params) => {
  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();
  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [totalDoctors],
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsResult,
    expensesByVendor,
    revenueByProcedureType,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        total: count(),
      })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, doctorsTable.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .where(eq(doctorsTable.clinicId, session.user.clinic.id))
      .groupBy(doctorsTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    db
      .select({
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
        ),
      )
      .groupBy(doctorsTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),
    getTodayAppointmentsWithDayjs(session.user.clinic.id),
    // OTIMIZAÇÃO: Query SQL otimizada usando generate_series do PostgreSQL
    //
    // ANTES: Buscava apenas dias com agendamentos + processamento no frontend para preencher gaps
    // AGORA: generate_series cria todos os 21 dias (10 antes + hoje + 10 depois) automaticamente
    //
    // BENEFÍCIOS:
    // 1. Transfere processamento do frontend para o banco (mais eficiente)
    // 2. Elimina lógica de "preenchimento de gaps" no appointments-chart.tsx
    // 3. Reduz tráfego de rede (dados já vêm estruturados)
    // 4. Aproveita otimizações nativas do PostgreSQL para séries de datas
    db.execute(sql`
      WITH date_series AS (
        SELECT generate_series(
          ${chartStartDate}::date,
          ${chartEndDate}::date,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        ds.date::text AS date,
        COALESCE(COUNT(a.id), 0)::int AS appointments,
        COALESCE(SUM(a.appointment_price_in_cents), 0)::bigint AS revenue
      FROM date_series ds
      LEFT JOIN ${appointmentsTable} a ON DATE(a.date) = ds.date
        AND a.clinic_id = ${session.user.clinic.id}
      GROUP BY ds.date
      ORDER BY ds.date
    `),

    // =================================
    // FINANCEIRO: Despesas por fornecedor
    // =================================
    db
      .select({
        vendorName: sql<string>`coalesce(${vendorsTable.name}, 'Sem fornecedor')`,
        totalInCents: sum(clinicFinancialTransactionsTable.amountInCents),
      })
      .from(clinicFinancialTransactionsTable)
      .leftJoin(
        vendorsTable,
        eq(clinicFinancialTransactionsTable.vendorId, vendorsTable.id),
      )
      .where(
        and(
          eq(clinicFinancialTransactionsTable.clinicId, session.user.clinic.id),
          isNull(clinicFinancialTransactionsTable.deletedAt),
          eq(clinicFinancialTransactionsTable.type, "expense"),
          gte(
            clinicFinancialTransactionsTable.transactionDate,
            new Date(from),
          ),
          lte(
            clinicFinancialTransactionsTable.transactionDate,
            new Date(to),
          ),
        ),
      )
      .groupBy(sql`coalesce(${vendorsTable.name}, 'Sem fornecedor')`)
      .orderBy(desc(sql`sum(${clinicFinancialTransactionsTable.amountInCents})`))
      .limit(10),

    // =================================
    // FINANCEIRO: Faturamento por tipo de procedimento
    // (somente o que foi efetivamente recebido: paid_amount > 0)
    // =================================
    db
      .select({
        procedureName: sql<string>`coalesce(${clinicProceduresTable.name}, 'Sem procedimento')`,
        totalInCents: sum(
          sql<number>`coalesce(${appointmentsTable.paidAmountInCents}, 0)`,
        ),
      })
      .from(appointmentsTable)
      .leftJoin(
        clinicProceduresTable,
        eq(appointmentsTable.clinicProcedureId, clinicProceduresTable.id),
      )
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          isNull(appointmentsTable.deletedAt),
          eq(appointmentsTable.status, "completed"),
          gte(appointmentsTable.date, new Date(from)),
          lte(appointmentsTable.date, new Date(to)),
          sql`coalesce(${appointmentsTable.paidAmountInCents}, 0) > 0`,
        ),
      )
      .groupBy(sql`coalesce(${clinicProceduresTable.name}, 'Sem procedimento')`)
      .orderBy(desc(sql`sum(coalesce(${appointmentsTable.paidAmountInCents}, 0))`))
      .limit(10),
  ]);

  // Processar resultado da query otimizada
  const dailyAppointmentsData = (
    dailyAppointmentsResult.rows as unknown as DailyAppointmentResult[]
  ).map((row) => ({
    date: row.date,
    appointments: Number(row.appointments),
    revenue: Number(row.revenue),
  }));

  return {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
    expensesByVendor,
    revenueByProcedureType,
  };
};
