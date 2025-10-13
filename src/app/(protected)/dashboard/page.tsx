import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageTitle,
} from "@/components/ui/page-container";
import { getDashboard } from "@/data/get-dashboard";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import {
  AppointmentsChartWrapper,
  StatsCardsWrapper,
  TopDoctorsWrapper,
  TopSpecialtiesWrapper,
} from "./_components/dashboard-wrappers";
import { DatePicker } from "./_components/date-picker";
import { TodayAppointmentsTable } from "./_components/today-appointments-table";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
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
  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `${ROUTES.DASHBOARD}?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`,
    );
  }
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });

  return (
    <PageContainer>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Título + Descrição */}
        <div>
          <PageTitle className="text-2xl font-semibold sm:text-3xl">
            Dashboard
          </PageTitle>
          <PageDescription className="text-muted-foreground mt-1 text-sm sm:text-base">
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </div>

        {/* DatePicker posicionado no canto direito, mesmo no mobile */}
        <div className="mt-2 flex justify-end sm:mt-0">
          <PageActions className="w-fit">
            <DatePicker />
          </PageActions>
        </div>
      </div>

      <PageContent>
        {/* Stats Cards - Sempre visível */}
        <StatsCardsWrapper
          totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
          totalAppointments={totalAppointments.total}
          totalPatients={totalPatients.total}
          totalDoctors={totalDoctors.total}
        />

        {/* Agendamentos de hoje - Sempre visível */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="text-muted-foreground hidden sm:block" />
              <CardTitle className="text-sm sm:text-base">
                Agendamentos de hoje
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TodayAppointmentsTable appointments={todayAppointments} />
          </CardContent>
        </Card>

        {/* Conteúdo apenas para desktop */}
        <div className="hidden space-y-6 lg:block">
          {/* Gráfico + Top Doctors */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
            <AppointmentsChartWrapper
              dailyAppointmentsData={dailyAppointmentsData}
            />
            <TopDoctorsWrapper doctors={topDoctors} />
          </div>

          {/* Top Especialidades */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
            <div></div> {/* Espaço vazio para manter o layout */}
            <TopSpecialtiesWrapper topSpecialties={topSpecialties} />
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
