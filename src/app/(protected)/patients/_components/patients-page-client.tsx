"use client";

import { Search, UserRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; // Hooks de navegação
import { useCallback, useState } from "react";
import { useDebouncedCallback } from "use-debounce"; // Para a busca

import { AddResourceButton } from "@/app/(protected)/_components/AddResourceButton";
import { useRegisterMobileNavFab } from "@/hooks/use-register-mobile-nav-fab";
import { DataTable } from "@/components/ui/data-table";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"; // Componente de Input
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle, // ... imports do PageContainer ...
} from "@/components/ui/page-container";
import type { Patient } from "@/types";

import { DataTablePagination } from "./data-table-pagination"; // Nosso novo componente de paginação
import { PatientMobileCard } from "./patient-mobile-card";
import { patientsTableColumns } from "./table-columns";
import UpsertPatientForm from "./upsert-patient-form";

interface PatientsPageClientProps {
  initialPatients: Patient[];
  pageCount: number; // Recebe a contagem de páginas
}

const PatientsPageClient = ({
  initialPatients,
  pageCount,
}: PatientsPageClientProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSuccess = () => {
    setIsDialogOpen(false);
    router.refresh(); // Atualiza a página para mostrar o novo paciente
  };

  const openAddPatientDialog = useCallback(() => {
    setIsDialogOpen(true);
  }, []);

  useRegisterMobileNavFab(openAddPatientDialog, "Adicionar paciente");

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("page", "1");
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Pacientes</PageTitle>
            <PageDescription>
              Gerencie os pacientes da sua clínica
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
          <AddResourceButton
              label="Adicionar Paciente"
              onClick={openAddPatientDialog}
              icon={<UserRound className="h-4 w-4" />}
              className="hidden md:inline-flex"
            />
          </PageActions>
        </PageHeader>
        <PageContent>
          {/* Container para o campo de busca com o ícone */}
          <div className="relative flex w-full justify-start md:justify-end">
            <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />

            <Input
              placeholder="Buscar por nome ou CPF..."
              className="w-full pl-9 md:max-w-sm"
              defaultValue={searchParams.get("search")?.toString()}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {initialPatients.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-sm">
              Nenhum paciente encontrado.
            </div>
          ) : (
            <>
              <div className="space-y-2 md:hidden">
                {initialPatients.map((patient) => (
                  <PatientMobileCard key={patient.id} patient={patient} />
                ))}
              </div>

              <div className="hidden md:block">
                <DataTable
                  data={initialPatients}
                  columns={patientsTableColumns}
                />
              </div>
            </>
          )}

          <DataTablePagination pageCount={pageCount} />
        </PageContent>
      </PageContainer>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <UpsertPatientForm 
          isOpen={isDialogOpen} 
          onSuccess={handleSuccess}
        />
      </Dialog>
    </>
  );
};

export default PatientsPageClient;
