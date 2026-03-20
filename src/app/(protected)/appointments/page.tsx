// src/app/(protected)/appointments/page.tsx
import dayjs from "dayjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  getAppointmentsForAgenda,
  getAppointmentsForList,
} from "@/data/appointments";
import { getDoctors } from "@/data/doctors";
import { getPatients } from "@/data/patients";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import { AppointmentsToolbar } from "./_components/appointments-toolbar";
import AgendaView from "./view-agenda";
import { AppointmentListView } from "./view-list";

const AppointmentsPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    doctorId?: string;
    from?: string;
    to?: string;
    view?: string;
  }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // 1. Guard Clauses de Sessão
  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  const clinicId = session.user.clinic.id;
  const { doctorId, from, to, view } = (await searchParams) ?? {};

  try {
    // 2. Verificação de Pré-requisitos (Dentistas e Pacientes)
    // Buscamos ambos primeiro para decidir o fluxo de redirecionamento
    const [doctorsData, patientsData] = await Promise.all([
      getDoctors(clinicId),
      getPatients(clinicId),
    ]);

    const doctors = doctorsData.doctors;
    const patients = patientsData.patients;

    // Prioridade 1: Se não tem Dentista, vai para cadastro de Dentistas
    if (doctors.length === 0) {
      redirect(ROUTES.DOCTORS); 
    }

    // Prioridade 2: Se tem Dentista mas não tem paciente, vai para cadastro de pacientes
    if (patients.length === 0) {
      redirect(ROUTES.PATIENTS);
    }

    // 3. Busca de Dados da Agenda (Só ocorre se passar pelos redirecionamentos acima)
    const [appointmentsForAgenda, appointmentsForList] = await Promise.all([
      getAppointmentsForAgenda(clinicId, doctorId),
      getAppointmentsForList(
        clinicId,
        doctorId,
        from ? dayjs(from).startOf("day").toDate() : undefined,
        to ? dayjs(to).endOf("day").toDate() : undefined,
      ),
    ]);

    return (
        <PageContainer>
          <PageHeader>
            <PageHeaderContent>
              <PageTitle>Agenda da clínica</PageTitle>
              <PageDescription>
                Visualize e gerencie os horários da equipe com uma agenda clara e
                organizada.
              </PageDescription>
            </PageHeaderContent>
          </PageHeader>

          <PageContent>
            <Tabs defaultValue={view === "lista" ? "lista" : "agenda"}>
              <AppointmentsToolbar doctors={doctors} patients={patients} />

              <TabsContent value="agenda">
                {/* Agenda visível apenas em telas md+ */}
                <div className="hidden md:block">
                  <AgendaView
                    appointments={appointmentsForAgenda}
                    patients={patients}
                    doctors={doctors}
                  />
                </div>
                <div className="md:hidden py-12 text-center text-sm text-muted-foreground">
                  A visualização de agenda está disponível apenas na versão
                  desktop. Use a lista para gerenciar os agendamentos no
                  celular.
                </div>
              </TabsContent>

              <TabsContent value="lista">
                <AppointmentListView appointments={appointmentsForList} />
              </TabsContent>
            </Tabs>
          </PageContent>
        </PageContainer>
    );
  } catch (error) {
    // Deixa os redirects do Next passarem sem logar/alterar a resposta
    if (
      error instanceof Error &&
      "digest" in error &&
      typeof (error as { digest?: string }).digest === "string" &&
      (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Erro ao carregar agendamentos:", error);

    return (
      <div className="p-8 text-center">
        <p className="text-destructive">
          Erro ao carregar dados. Tente novamente mais tarde.
        </p>
      </div>
    );
  }
};

export default AppointmentsPage;