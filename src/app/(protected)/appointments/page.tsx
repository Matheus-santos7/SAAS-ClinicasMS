// src/app/(protected)/appointments/page.tsx
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
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

import AddAppointmentButton from "./_components/appointmentList/add-appointment-button";
import { appointmentsTableColumns } from "./_components/appointmentList/table-columns";
import AgendaView from "./_components/calendar/agenda-view";
import { DoctorFilter } from "./_components/doctor-filter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AppointmentsPage = async (props: any) => {
  const searchParams = props.searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }
  if (!session.user.clinic) {
    redirect(ROUTES.CLINIC_FORM);
  }
  if (!session.user.plan) {
    redirect(ROUTES.SUBSCRIPTION);
  }
  const doctorId = searchParams?.doctorId;

  const [patients, doctors] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
      orderBy: (doctors, { asc }) => [asc(doctors.name)],
    }),
  ]);

  const whereClause = doctorId
    ? and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        eq(appointmentsTable.doctorId, doctorId),
      )
    : eq(appointmentsTable.clinicId, session.user.clinic.id);

  const appointmentsRaw = await db.query.appointmentsTable.findMany({
    where: whereClause,
    with: {
      patient: true,
      doctor: true,
    },
    orderBy: (appointments, { asc }) => [asc(appointments.date)],
  });

  // Use appointmentsRaw directly if 'status' does not exist
  const appointments = appointmentsRaw;

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
        <DoctorFilter doctors={doctors} />
        <Tabs defaultValue="agenda">
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>
          <TabsContent value="agenda" className="mt-6">
            <AgendaView
              appointments={appointments.map((a) => ({
                ...a,
                status: "confirmed",
              }))}
            />
          </TabsContent>
          <TabsContent value="lista">
            <DataTable data={appointments} columns={appointmentsTableColumns} />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
};

export default AppointmentsPage;
