import dayjs from "dayjs";
import { DollarSign } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { DateRangeFilter } from "@/components/filters/date-range-filter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getAppointmentsForList } from "@/data/appointments";
import { formatCurrencyInCents } from "@/helpers/currency";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";
import { RegisterPaymentDialog } from "./_components/register-payment-dialog";

const FinancialPage = async ({
  searchParams,
}: {
  searchParams?: Promise<{
    from?: string;
    to?: string;
  }>;
}) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }
  if (!session.user.clinic) {
    redirect(ROUTES.CLINIC_FORM);
  }

  const clinicId = session.user.clinic.id;
  const { from, to } = (await searchParams) ?? {};

  const fromDate = from ? dayjs(from).startOf("day").toDate() : undefined;
  const toDate = to ? dayjs(to).endOf("day").toDate() : undefined;

  const appointments = await getAppointmentsForList(
    clinicId,
    undefined,
    fromDate,
    toDate,
  );

  const completedAppointments = appointments.filter(
    (appointment) => appointment.status === "completed",
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Financeiro</PageTitle>
          <PageDescription>
            Acompanhe as receitas, despesas e o fluxo de caixa da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DateRangeFilter />
        </PageActions>
      </PageHeader>
      <PageContent>
        <Tabs defaultValue="appointments">
          <TabsList>
            <TabsTrigger value="appointments">Recebimentos de consultas</TabsTrigger>
            <TabsTrigger value="fixed">Receitas fixas/variáveis</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Consultas concluídas (a receber)</CardTitle>
              </CardHeader>
              <CardContent>
            {/* Mobile: cards */}
            <div className="space-y-3 md:hidden">
              {completedAppointments.length === 0 && (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Nenhuma consulta concluída no período selecionado.
                </p>
              )}
              {completedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-border bg-card/60 flex flex-col gap-1 rounded-xl border p-3 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-foreground text-sm font-semibold">
                        {appointment.patient.name}
                      </p>
                      <p className="text-muted-foreground">
                        {dayjs(appointment.date).format(
                          "DD/MM/YYYY [às] HH:mm",
                        )}
                      </p>
                    </div>
                    <span className="text-emerald-700 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium">
                      Concluído
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Dr(a). {appointment.doctor.name}
                  </p>
                  <p className="font-medium">
                    Valor recebido:{" "}
                    {formatCurrencyInCents(
                      appointment.paidAmountInCents ??
                        appointment.appointmentPriceInCents,
                    )}
                  </p>
                  <div className="pt-2">
                    <RegisterPaymentDialog
                      appointmentId={appointment.id}
                      defaultAmountInCents={appointment.appointmentPriceInCents}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: tabela simples */}
            <div className="hidden md:block">
              {completedAppointments.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  Nenhuma consulta concluída no período selecionado.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-sm">
                    <thead className="border-b text-xs text-muted-foreground">
                      <tr className="text-left">
                        <th className="px-2 py-2">Data</th>
                        <th className="px-2 py-2">Paciente</th>
                        <th className="px-2 py-2">Dentista</th>
                        <th className="px-2 py-2 text-right">Valor recebido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-2 py-2">
                            {dayjs(appointment.date).format(
                              "DD/MM/YYYY HH:mm",
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {appointment.patient.name}
                          </td>
                          <td className="px-2 py-2">
                            {appointment.doctor.name}
                          </td>
                          <td className="px-2 py-2 text-right font-medium">
                            {formatCurrencyInCents(
                              appointment.paidAmountInCents ??
                                appointment.appointmentPriceInCents,
                            )}
                          </td>
                          <td className="px-2 py-2 text-right">
                            <RegisterPaymentDialog
                              appointmentId={appointment.id}
                              defaultAmountInCents={
                                appointment.appointmentPriceInCents
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fixed" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Receitas fixas e variáveis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Em breve: grid para cadastro de receitas recorrentes (mensalidades,
                  aluguéis, etc.) e variáveis. A estrutura de contas a receber/pagar
                  já está preparada no banco via `clinicFinancialTransactions`.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
};

export default FinancialPage;
