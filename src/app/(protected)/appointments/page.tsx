// src/app/(protected)/appointments/page.tsx
import dayjs from "dayjs";
import { and, eq, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

// Importações atualizadas para a nova estrutura
import AddAppointmentButton from "./_components/add-appointment-button";
import { DoctorFilter } from "./_components/doctor-filter";
import AgendaView from "./_components/view-agenda";
import { AppointmentListView } from "./_components/view-list";

const AppointmentsPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    doctorId?: string;
    from?: string;
    to?: string;
  }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  const { doctorId, from, to } = (
    searchParams ? await searchParams : ({} as Record<string, never>)
  ) as {
    doctorId?: string;
    from?: string;
    to?: string;
  };

  const [patients, doctors] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
      orderBy: (doctors, { asc }) => [asc(doctors.name)],
    }),
  ]);

  // --- LÓGICA DE BUSCA DE DADOS SEPARADA ---

  // 1. Busca para a AGENDA (sem filtro de data)
  const agendaConditions = [
    eq(appointmentsTable.clinicId, session.user.clinic.id),
    doctorId ? eq(appointmentsTable.doctorId, doctorId) : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const appointmentsForAgenda = await db.query.appointmentsTable.findMany({
    where: and(...agendaConditions),
    with: { patient: true, doctor: true },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  // 2. Busca para a LISTA (com filtro de data)
  const listConditions = [
    eq(appointmentsTable.clinicId, session.user.clinic.id),
    doctorId ? eq(appointmentsTable.doctorId, doctorId) : undefined,
    from
      ? gte(appointmentsTable.date, dayjs(from).startOf("day").toDate())
      : undefined,
    to
      ? lte(appointmentsTable.date, dayjs(to).endOf("day").toDate())
      : undefined,
  ].filter((c): c is NonNullable<typeof c> => c !== undefined);

  const appointmentsForList = await db.query.appointmentsTable.findMany({
    where: and(...listConditions),
    with: { patient: true, doctor: true },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Agendamentos</PageTitle>
          <PageDescription>
            Gerencie os agendamentos da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddAppointmentButton patients={patients} doctors={doctors} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <Tabs defaultValue="agenda">
          <div className="flex items-center justify-between gap-4">
            <DoctorFilter doctors={doctors} />
            <TabsList>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="lista">Lista</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="agenda">
            <AgendaView
              appointments={appointmentsForAgenda.map((a) => ({
                ...a,
                status: "confirmed",
              }))}
              patients={patients}
              doctors={doctors}
            />
          </TabsContent>

          <TabsContent value="lista">
            <AppointmentListView appointments={appointmentsForList} />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
