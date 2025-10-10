import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getDashboard } from "@/data/get-dashboard";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import { appointmentsTableColumns } from "../appointments/_components/view-list/table-columns";
import AppointmentsChart from "./_components/appointments-chart";
import { DatePicker } from "./_components/date-picker";
import StatsCards from "./_components/stats-cards";
import TopDoctors from "./_components/top-doctors";
import TopSpecialties from "./_components/top-specialties";

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
      {/* Header responsivo */}
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription className="hidden sm:block">
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions className="w-full sm:w-auto">
          <DatePicker />
        </PageActions>
      </PageHeader>

      <PageContent>
        {/* Stats Cards - Sempre visível */}
        <StatsCards
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
          <CardContent className="overflow-x-auto">
            <DataTable
              columns={appointmentsTableColumns}
              data={todayAppointments}
            />
          </CardContent>
        </Card>

        {/* Conteúdo apenas para desktop */}
        <div className="hidden space-y-6 lg:block">
          {/* Gráfico + Top Doctors */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
            <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
            <TopDoctors doctors={topDoctors} />
          </div>

          {/* Top Especialidades */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2.25fr_1fr]">
            <div></div> {/* Espaço vazio para manter o layout */}
            <TopSpecialties topSpecialties={topSpecialties} />
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
