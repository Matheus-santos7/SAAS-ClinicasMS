// src/app/(protected)/appointments/page.tsx
import { eq } from "drizzle-orm";
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
import AgendaView from "./_components/calendar/agenda-view"; // Importe o novo componente

const AppointmentsPage = async () => {
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
  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session.user.clinic.id),
      with: {
        patient: true,
        doctor: true,
      },
      orderBy: (appointments, { asc }) => [asc(appointments.date)],
    }),
  ]);

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
          <TabsList>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>
          <TabsContent value="agenda" className="mt-6">
            <AgendaView appointments={appointments} />
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
