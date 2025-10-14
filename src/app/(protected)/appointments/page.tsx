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

// Importações atualizadas para a nova estrutura
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

  const { doctorId, from, to } = (
    searchParams ? await searchParams : ({} as Record<string, never>)
  ) as {
    doctorId?: string;
    from?: string;
    to?: string;
  };

  // Busca pacientes e médicos usando as funções centralizadas
  const [patientsData, doctorsData] = await Promise.all([
    getPatients(session.user.clinic.id), // Pega todos os pacientes sem paginação para seleção
    getDoctors(session.user.clinic.id), // Pega todos os médicos da clínica
  ]);

  const patients = patientsData.patients;
  const doctors = doctorsData.doctors;

  // --- LÓGICA DE BUSCA DE DADOS USANDO FUNÇÕES CENTRALIZADAS ---

  // 1. Busca para a AGENDA (sem filtro de data)
  const appointmentsForAgenda = await getAppointmentsForAgenda(
    session.user.clinic.id,
    doctorId,
  );

  // 2. Busca para a LISTA (com filtro de data)
  const appointmentsForList = await getAppointmentsForList(
    session.user.clinic.id,
    doctorId,
    from ? dayjs(from).startOf("day").toDate() : undefined,
    to ? dayjs(to).endOf("day").toDate() : undefined,
  );

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
