import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function FinancialPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Financeiro</PageTitle>
          <PageDescription>
            Esta área será reconstruída. Nenhuma funcionalidade disponível por
            enquanto.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
    </PageContainer>
  );
}
