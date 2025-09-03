"use client";

import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { evolutionTable } from "@/db/schema";

type EvolutionEntry = typeof evolutionTable.$inferSelect;

interface EvolutionCardProps {
  evolution: EvolutionEntry;
  onView: (evolution: EvolutionEntry) => void;
  onEdit: (evolution: EvolutionEntry) => void;
  onDelete: (evolution: EvolutionEntry) => void;
}

export const EvolutionCard = ({
  evolution,
  onView,
  onEdit,
  onDelete,
}: EvolutionCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Evolução</CardTitle>
          <CardDescription>
            {new Date(evolution.date).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(evolution)}>
              <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(evolution)}>
              <Edit className="mr-2 h-4 w-4" /> Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onDelete(evolution)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-4 text-sm">
          {evolution.description}
        </p>
      </CardContent>
      {/* TODO: Mostrar thumbnails de imagens aqui se houver */}
      {/* <CardFooter> <p>Imagens Anexadas</p> </CardFooter> */}
    </Card>
  );
};
