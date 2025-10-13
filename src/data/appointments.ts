import dayjs from "dayjs";
import { and, count, eq, gte, isNull, lte } from "drizzle-orm";

import { APP_CONFIG } from "@/constants/config";
import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";

export async function getAppointments(
  clinicId: string,
  page: number = 1,
  search?: string,
  from?: Date,
  to?: Date,
) {
  const itemsPerPage = APP_CONFIG.PAGINATION.APPOINTMENTS_PER_PAGE;

  const whereConditions = [
    eq(appointmentsTable.clinicId, clinicId),
    isNull(appointmentsTable.deletedAt), // Filtrar apenas registros não deletados
  ];

  // Filtro por data
  if (from) {
    whereConditions.push(gte(appointmentsTable.date, from));
  }
  if (to) {
    whereConditions.push(lte(appointmentsTable.date, to));
  }

  // Filtro por busca seria implementado com joins se necessário
  // Por simplicidade, deixo sem implementação da busca por enquanto

  const whereCondition = and(...whereConditions);

  const [appointments, totalAppointmentsResult] = await Promise.all([
    db.query.appointmentsTable.findMany({
      where: whereCondition,
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      orderBy: (appointments, { desc }) => [desc(appointments.date)],
      with: {
        patient: true,
        doctor: true,
      },
    }),
    db.select({ total: count() }).from(appointmentsTable).where(whereCondition),
  ]);

  const pageCount = Math.ceil(
    (totalAppointmentsResult[0]?.total ?? 0) / itemsPerPage,
  );

  return { appointments, pageCount };
}

export async function getAppointmentById(
  appointmentId: string,
  clinicId: string,
) {
  const appointment = await db.query.appointmentsTable.findFirst({
    where: and(
      eq(appointmentsTable.id, appointmentId),
      eq(appointmentsTable.clinicId, clinicId),
      isNull(appointmentsTable.deletedAt), // Filtrar apenas registros não deletados
    ),
    with: {
      patient: true,
      doctor: true,
    },
  });

  return appointment;
}

export async function getAppointmentsByDateRange(
  clinicId: string,
  from: Date,
  to: Date,
) {
  const appointments = await db.query.appointmentsTable.findMany({
    where: and(
      eq(appointmentsTable.clinicId, clinicId),
      isNull(appointmentsTable.deletedAt), // Filtrar apenas registros não deletados
      gte(appointmentsTable.date, from),
      lte(appointmentsTable.date, to),
    ),
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
    with: {
      patient: true,
      doctor: true,
    },
  });

  return appointments;
}

export async function getAppointmentsForAgenda(
  clinicId: string,
  doctorId?: string,
) {
  const whereConditions = [
    eq(appointmentsTable.clinicId, clinicId),
    isNull(appointmentsTable.deletedAt), // Filtrar apenas registros não deletados
  ];

  if (doctorId) {
    whereConditions.push(eq(appointmentsTable.doctorId, doctorId));
  }

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(...whereConditions),
    with: { patient: true, doctor: true },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  return appointments;
}

export async function getAppointmentsForList(
  clinicId: string,
  doctorId?: string,
  from?: Date,
  to?: Date,
) {
  const whereConditions = [
    eq(appointmentsTable.clinicId, clinicId),
    isNull(appointmentsTable.deletedAt), // Filtrar apenas registros não deletados
  ];

  if (doctorId) {
    whereConditions.push(eq(appointmentsTable.doctorId, doctorId));
  }

  if (from) {
    whereConditions.push(gte(appointmentsTable.date, from));
  }

  if (to) {
    whereConditions.push(lte(appointmentsTable.date, to));
  }

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(...whereConditions),
    with: { patient: true, doctor: true },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  return appointments;
}

/**
 * Busca apenas os agendamentos do dia atual
 * @param clinicId - ID da clínica
 * @returns Lista de agendamentos do dia atual com dados do paciente e médico
 */
export async function getTodayAppointments(clinicId: string) {
  const today = new Date();

  // Define o início do dia (00:00:00)
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Define o fim do dia (23:59:59.999)
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999,
  );

  const whereConditions = [
    eq(appointmentsTable.clinicId, clinicId),
    isNull(appointmentsTable.deletedAt), // Filtrar apenas registros não deletados
    gte(appointmentsTable.date, startOfDay),
    lte(appointmentsTable.date, endOfDay),
  ];

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(...whereConditions),
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  return appointments;
}

/**
 * Versão alternativa usando dayjs para buscar agendamentos do dia atual
 * @param clinicId - ID da clínica
 * @returns Lista de agendamentos do dia atual com dados do paciente e médico
 */
export async function getTodayAppointmentsWithDayjs(clinicId: string) {
  const startOfDay = dayjs().startOf("day").toDate();
  const endOfDay = dayjs().endOf("day").toDate();

  const whereConditions = [
    eq(appointmentsTable.clinicId, clinicId),
    isNull(appointmentsTable.deletedAt),
    gte(appointmentsTable.date, startOfDay),
    lte(appointmentsTable.date, endOfDay),
  ];

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(...whereConditions),
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  return appointments;
}
