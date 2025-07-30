// /app/patients/[patientId]/_components/evolution-tab.tsx
"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { evolutionTable } from "@/db/schema";

// Importe o futuro formulário de evolução
// import { EvolutionEntryForm } from "./evolution-entry-form";

interface EvolutionTabProps {
  patientId: string;
  evolutionEntries: (typeof evolutionTable.$inferSelect)[];
}

export const EvolutionTab = ({
  evolutionEntries,
}: EvolutionTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quadro de Evolução</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Entrada de Evolução</DialogTitle>
            </DialogHeader>
            {/* TODO: Criar e importar o EvolutionEntryForm */}
            {/* <EvolutionEntryForm patientId={patientId} onSuccess={() => setIsFormOpen(false)} /> */}
            <p className="p-4 text-center">Formulário de nova entrada aqui.</p>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evolutionEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhuma entrada de evolução encontrada.
                </TableCell>
              </TableRow>
            )}
            {evolutionEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {new Date(entry.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {entry.description}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">
                    Ver Documentos
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
