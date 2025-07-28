"use client";

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
import { patientsTable } from "@/db/schema";

import AddPatientButton from "./add-patient-button";
import PatientSearchForm from "./patient-search-form";
import { patientsTableColumns } from "./table-columns";

interface PatientsPageClientProps {
  initialPatients: (typeof patientsTable.$inferSelect)[];
}

const PatientsPageClient = ({ initialPatients }: PatientsPageClientProps) => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Pacientes</PageTitle>
          <PageDescription>
            Gerencie os pacientes da sua clínica
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <PatientSearchForm isOpen={false} onSuccess={() => {}} />
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <DataTable data={initialPatients} columns={patientsTableColumns} />
        {initialPatients.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            {initialPatients.length === 0
              ? "Nenhum paciente cadastrado ainda."
              : "Nenhum paciente encontrado com os critérios de busca."}
          </div>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPageClient;
