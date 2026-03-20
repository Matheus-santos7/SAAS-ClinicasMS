"use client";

import { ClipboardList, Package, Truck } from "lucide-react";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ExpenseTypesTab } from "./expense-types-tab";
import { ProceduresTab } from "./procedures-tab";
import { VendorsTab } from "./vendors-tab";

type ProcedureRow = {
  id: string;
  clinicId: string;
  name: string;
  basePriceInCents: number;
  durationSeconds: number;
  hasReturn: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

type ExpenseTypeRow = {
  id: string;
  clinicId: string;
  name: string;
  recurrenceType:
    | "one_time"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "yearly";
  notes: string | null;
  vendorId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  vendorName: string | null;
};

type VendorRow = {
  id: string;
  clinicId: string;
  name: string;
  contactInfo: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
};

interface RegistryPageClientProps {
  procedures: ProcedureRow[];
  expenseTypes: ExpenseTypeRow[];
  vendors: VendorRow[];
}

export function RegistryPageClient({
  procedures,
  expenseTypes,
  vendors,
}: RegistryPageClientProps) {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Cadastros</PageTitle>
          <PageDescription>
            Procedimentos, tipos de despesa e fornecedores usados em relatórios e
            fluxos do sistema.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <Tabs defaultValue="procedimentos" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 sm:grid-cols-3">
            <TabsTrigger
              value="procedimentos"
              className="gap-2 py-2.5 text-xs sm:text-sm"
            >
              <ClipboardList className="size-4 shrink-0" />
              Procedimentos
            </TabsTrigger>
            <TabsTrigger
              value="despesas"
              className="gap-2 py-2.5 text-xs sm:text-sm"
            >
              <Package className="size-4 shrink-0" />
              Tipos de despesa
            </TabsTrigger>
            <TabsTrigger
              value="fornecedores"
              className="gap-2 py-2.5 text-xs sm:text-sm"
            >
              <Truck className="size-4 shrink-0" />
              Fornecedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="procedimentos" className="mt-6">
            <ProceduresTab procedures={procedures} />
          </TabsContent>

          <TabsContent value="despesas" className="mt-6">
            <ExpenseTypesTab expenseTypes={expenseTypes} vendors={vendors} />
          </TabsContent>

          <TabsContent value="fornecedores" className="mt-6">
            <VendorsTab vendors={vendors} />
          </TabsContent>
        </Tabs>
      </PageContent>
    </PageContainer>
  );
}
