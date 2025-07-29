"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation"; // Hooks de navegação
import { useDebouncedCallback } from "use-debounce"; // Para a busca

import { DataTable } from "@/components/ui/data-table";
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
import { patientsTable } from "@/db/schema";

import AddPatientButton from "./add-patient-button";
import { DataTablePagination } from "./data-table-pagination"; // Nosso novo componente de paginação
import { patientsTableColumns } from "./table-columns";

interface PatientsPageClientProps {
  initialPatients: (typeof patientsTable.$inferSelect)[];
  pageCount: number; // Recebe a contagem de páginas
}

const PatientsPageClient = ({
  initialPatients,
  pageCount,
}: PatientsPageClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Função "debounced" para atualizar a busca na URL
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1"); // Sempre volte para a página 1 ao buscar
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300); // 300ms de espera

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
          <AddPatientButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        {/* Container para o campo de busca com o ícone */}
        <div className="relative flex justify-end">
          {/* O Ícone */}
          <Search className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />

          {/* O Input com padding à esquerda para dar espaço ao ícone */}
          <Input
            placeholder="Buscar por nome ou CPF..."
            className="max-w-sm pl-9" // <-- Aumentamos o padding esquerdo (pl)
            defaultValue={searchParams.get("search")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <DataTable data={initialPatients} columns={patientsTableColumns} />

        {/* MENSAGEM DE NENHUM RESULTADO */}
        {initialPatients.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            Nenhum paciente encontrado.
          </div>
        )}

        {/* CONTROLES DE PAGINAÇÃO */}
        <DataTablePagination pageCount={pageCount} />
      </PageContent>
    </PageContainer>
  );
};

export default PatientsPageClient;
