import { DollarSign } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

import { Button } from "@/components/ui/button";
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
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

const FinancialPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }
  if (!session.user.clinic) {
    redirect(ROUTES.CLINIC_FORM);
  }

  // Futuramente, aqui você buscará os dados financeiros da clínica.
  // const financialData = await getFinancialDashboardData(session.user.clinic.id);

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
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </PageActions>
      </PageHeader>
      <PageContent>
        {/* Aqui virão os componentes do dashboard financeiro */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground py-12 text-center">
              <p>Módulo financeiro em construção.</p>
              <p className="text-sm">
                Em breve você poderá ver o fluxo de caixa, despesas e receitas.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default FinancialPage;
