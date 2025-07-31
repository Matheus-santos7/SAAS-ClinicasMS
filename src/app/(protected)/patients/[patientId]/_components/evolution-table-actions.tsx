"use client";

import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEvolutionStore } from "./evolution-tab"; // Criaremos este store
import { EvolutionEntryWithDoctor } from "./evolution-table-columns";

interface EvolutionTableActionsProps {
  evolution: EvolutionEntryWithDoctor;
}

export function EvolutionTableActions({
  evolution,
}: EvolutionTableActionsProps) {
  const { handleView, handleEdit, handleDelete } = useEvolutionStore();

  return (
    <div className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleView(evolution)}>
            <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(evolution)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => handleDelete(evolution)}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
