"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { evolutionTable } from "@/db/schema";
import { EvolutionCard } from "./evolution-card";
import { EvolutionEntryForm } from "./evolutionEntryForm";
import { useAction } from "next-safe-action/hooks";
import { deleteEvolution } from "@/actions/upsert-evolution/delete-evolution";
import { toast } from "sonner";

type EvolutionEntry = typeof evolutionTable.$inferSelect;

interface EvolutionTabProps {
  patientId: string;
  evolutionEntries: EvolutionEntry[];
  doctors: Array<{ id: string; name: string }>;
}

export const EvolutionTab = ({
  patientId,
  evolutionEntries,
  doctors,
}: EvolutionTabProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEvolution, setSelectedEvolution] =
    useState<EvolutionEntry | null>(null);

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteEvolution,
    {
      onSuccess: (data) => {
        // Corrige o acesso ao campo de sucesso e mensagem
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          typeof data.success === "string"
        ) {
          toast.success(data.success);
        } else {
          toast.success("Evolução excluída com sucesso.");
        }
        setIsDeleteAlertOpen(false);
      },
      onError: (error) => {
        // Corrige o acesso à mensagem de erro
        const errorMessage =
          error &&
          typeof error === "object" &&
          "error" in error &&
          error.error &&
          typeof error.error === "object" &&
          "serverError" in error.error
            ? (error.error.serverError as string)
            : "Erro ao excluir evolução.";
        toast.error(errorMessage);
      },
    },
  );

  // Handlers para abrir modais
  const handleAdd = () => {
    setSelectedEvolution(null);
    setIsFormOpen(true);
  };

  const handleEdit = (evolution: EvolutionEntry) => {
    setSelectedEvolution(evolution);
    setIsFormOpen(true);
  };

  const handleView = (evolution: EvolutionEntry) => {
    setSelectedEvolution(evolution);
    setIsViewModalOpen(true);
  };

  const handleDelete = (evolution: EvolutionEntry) => {
    setSelectedEvolution(evolution);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEvolution) {
      executeDelete({ id: selectedEvolution.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quadro de Evolução</h2>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Evolução
        </Button>
      </div>

      {evolutionEntries.length === 0 ? (
        <div className="border-muted-foreground/30 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
          <h3 className="text-xl font-semibold">Nenhuma evolução registrada</h3>
          <p className="text-muted-foreground text-sm">
            Clique em "Adicionar Evolução" para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {evolutionEntries.map((entry) => (
            <EvolutionCard
              key={entry.id}
              evolution={entry}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal/Dialog para Adicionar/Editar */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvolution ? "Editar Evolução" : "Nova Evolução"}
            </DialogTitle>
          </DialogHeader>
          <EvolutionEntryForm
            patientId={patientId}
            initialData={selectedEvolution}
            onSuccess={() => setIsFormOpen(false)}
            doctors={doctors}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Visualizar Detalhes */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Evolução</DialogTitle>
            <DialogDescription>
              {selectedEvolution &&
                new Date(selectedEvolution.date).toLocaleDateString("pt-BR", {
                  dateStyle: "full",
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="prose dark:prose-invert max-w-none">
            <h4>Descrição</h4>
            <p>{selectedEvolution?.description}</p>
            <h4>Observações</h4>
            <p>{selectedEvolution?.observations || "Nenhuma observação."}</p>
            {/* TODO: Renderizar imagens aqui */}
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerta de Confirmação para Deletar */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente
              o registro de evolução de
              {selectedEvolution &&
                ` ${new Date(selectedEvolution.date).toLocaleDateString("pt-BR")}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Deletando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
