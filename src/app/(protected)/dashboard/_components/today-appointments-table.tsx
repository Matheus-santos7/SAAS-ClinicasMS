"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppointmentWithRelations } from "@/types";

import { appointmentsTableColumns } from "../../appointments/view-list/table-columns";

interface TodayAppointmentsTableProps {
  appointments: AppointmentWithRelations[];
}

export function TodayAppointmentsTable({
  appointments,
}: TodayAppointmentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Cálculos de paginação
  const totalItems = appointments.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = appointments.slice(startIndex, endIndex);

  // Função para ir para uma página específica
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Função para alterar o tamanho da página
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number(newPageSize));
    setCurrentPage(1); // Reset para primeira página
  };

  // Não mostrar paginação se houver poucos itens
  const shouldShowPagination = totalItems > 3;

  if (totalItems === 0) {
    return (
      <div className="rounded-md border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum agendamento encontrado para hoje.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="overflow-x-auto">
        <DataTable columns={appointmentsTableColumns} data={currentData} />
      </div>

      {/* Controles de Paginação - apenas se houver itens suficientes */}
      {shouldShowPagination && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Informações da página */}
          <div className="text-muted-foreground text-sm">
            Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de{" "}
            {totalItems}
          </div>

          {/* Controles compactos */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Seletor de itens por página */}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground hidden text-sm sm:inline">
                Por página:
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botões de navegação compactos */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronsLeft className="h-3 w-3" />
                <span className="sr-only">Primeira página</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-3 w-3" />
                <span className="sr-only">Página anterior</span>
              </Button>

              <div className="flex items-center gap-1 px-3 text-sm font-medium">
                {currentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-3 w-3" />
                <span className="sr-only">Próxima página</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronsRight className="h-3 w-3" />
                <span className="sr-only">Última página</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
