// src/app/(protected)/appointments/page.tsx
import dayjs from "dayjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
import {
  getAppointmentsForAgenda,
  getAppointmentsForList,
} from "@/data/appointments";
import { getDoctors } from "@/data/doctors";
import { getPatients } from "@/data/patients";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import AddAppointmentButton from "./_components/add-appointment-button";
import { DoctorFilter } from "./_components/doctor-filter";
import AgendaView from "./view-agenda";
import { AppointmentListView } from "./view-list";

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

  const { doctorId, from, to } = (await searchParams) ?? {};

  try {
    const [
      patientsData,
      doctorsData,
      appointmentsForAgenda,
      appointmentsForList,
    ] = await Promise.all([
      getPatients(session.user.clinic.id),
      getDoctors(session.user.clinic.id),
      getAppointmentsForAgenda(session.user.clinic.id, doctorId),
      getAppointmentsForList(
        session.user.clinic.id,
        doctorId,
        from ? dayjs(from).startOf("day").toDate() : undefined,
        to ? dayjs(to).endOf("day").toDate() : undefined,
      ),
    ]);

    const patients = patientsData.patients;
    const doctors = doctorsData.doctors;

    if (!patients.length || !doctors.length) {
      return <div>Nenhum paciente ou médico disponível.</div>;
    }

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
                appointments={appointmentsForAgenda} // Removido status: "confirmed"
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
  } catch {
    return <div>Erro ao carregar dados. Tente novamente.</div>;
  }
};

export default AppointmentsPage;
