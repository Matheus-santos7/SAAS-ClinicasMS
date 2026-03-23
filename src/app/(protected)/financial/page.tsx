import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import {
  getFinancialSummary,
  getPayablesOpen,
  getPayablesPaid,
  getReceivables,
} from "@/data/financial";
import { getExpenseTypesForFinancial, getVendors } from "@/data/registry";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

import { FinancialPageClient } from "./_components/financial-page-client";

export default async function FinancialPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect(ROUTES.LOGIN);
  if (!session.user.clinic) redirect(ROUTES.CLINIC_FORM);
  if (!session.user.plan) redirect(ROUTES.SUBSCRIPTION);

  const clinicId = session.user.clinic.id;

  const [summary, receivables, payablesOpen, payablesPaid, expenseTypes, vendors] =
    await Promise.all([
      getFinancialSummary(clinicId),
      getReceivables(clinicId),
      getPayablesOpen(clinicId),
      getPayablesPaid(clinicId),
      getExpenseTypesForFinancial(clinicId),
      getVendors(clinicId),
    ]);

  return (
    <FinancialPageClient
      summary={summary}
      receivables={receivables}
      payablesOpen={payablesOpen}
      payablesPaid={payablesPaid}
      expenseTypes={expenseTypes}
      vendors={vendors.map((v) => ({ id: v.id, name: v.name }))}
    />
  );
}
