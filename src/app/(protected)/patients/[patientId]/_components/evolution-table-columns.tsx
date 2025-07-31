"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { evolutionTable } from "@/db/schema";
import { doctorsTable } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { EvolutionTableActions } from "./evolution-table-actions";

// Define o tipo para a entrada da tabela, incluindo a relação com o médico
export type EvolutionEntryWithDoctor = typeof evolutionTable.$inferSelect & {
  doctor: Pick<typeof doctorsTable.$inferSelect, "name"> | null;
};

export const columns: ColumnDef<EvolutionEntryWithDoctor>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="pl-4">
        {format(new Date(row.original.date), "dd/MM/yyyy", {
          locale: ptBR,
        })}
      </div>
    ),
  },
  {
    accessorKey: "doctor.name",
    header: "Médico Responsável",
    cell: ({ row }) => row.original.doctor?.name ?? "N/A",
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => (
      <p className="max-w-[400px] truncate">{row.original.description}</p>
    ),
  },
  // Coluna para documentos (funcionalidade futura)
  {
    id: "documents",
    header: "Documentos",
    cell: () => <span className="text-muted-foreground text-xs">Nenhum</span>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Ações</div>,
    cell: ({ row }) => <EvolutionTableActions evolution={row.original} />,
  },
];