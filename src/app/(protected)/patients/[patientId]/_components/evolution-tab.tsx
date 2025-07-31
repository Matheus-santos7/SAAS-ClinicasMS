"use client";

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
import { EvolutionEntryForm } from "./evolutionEntryForm";
import { useAction } from "next-safe-action/hooks";
import { deleteEvolution } from "@/actions/upsert-evolution/delete-evolution";
import { toast } from "sonner";
import { create } from "zustand";

import { DataTable } from "@/components/ui/data-table";
import { columns, EvolutionEntryWithDoctor } from "./evolution-table-columns";

// Store para gerenciar o estado dos modais
type EvolutionStore = {
  selectedEvolution: EvolutionEntryWithDoctor | null;
  isFormOpen: boolean;
  isViewModalOpen: boolean;
  isDeleteAlertOpen: boolean;
  handleView: (evolution: EvolutionEntryWithDoctor) => void;
  handleEdit: (evolution: EvolutionEntryWithDoctor | null) => void;
  handleDelete: (evolution: EvolutionEntryWithDoctor) => void;
  closeAll: () => void;
};

export const useEvolutionStore = create<EvolutionStore>((set) => ({
  selectedEvolution: null,
  isFormOpen: false,
  isViewModalOpen: false,
  isDeleteAlertOpen: false,
  handleView: (evolution) => set({ selectedEvolution: evolution, isViewModalOpen: true }),
  handleEdit: (evolution: EvolutionEntryWithDoctor | null) => set({ selectedEvolution: evolution, isFormOpen: true }),
  handleDelete: (evolution) => set({ selectedEvolution: evolution, isDeleteAlertOpen: true }),
  closeAll: () => set({ 
    isFormOpen: false, 
    isViewModalOpen: false, 
    isDeleteAlertOpen: false, 
    selectedEvolution: null 
  }),
}));


interface EvolutionTabProps {
  patientId: string;
  evolutionEntries: EvolutionEntryWithDoctor[];
  doctors: Array<{ id: string; name: string }>;
}

export const EvolutionTab = ({
  patientId,
  evolutionEntries,
  doctors,
}: EvolutionTabProps) => {
  const {
    isFormOpen,
    isDeleteAlertOpen,
    isViewModalOpen,
    selectedEvolution,
    handleEdit,
    handleView,
    handleDelete,
    closeAll,
  } = useEvolutionStore();

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteEvolution,
    {
      onSuccess: (data) => {
        toast.success(data?.data?.success || "Evolução excluída com sucesso.");
        closeAll();
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Erro ao excluir evolução.");
      },
    },
  );

  const confirmDelete = () => {
    if (selectedEvolution) {
      executeDelete({ id: selectedEvolution.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quadro de Evolução</h2>
        <Button onClick={() => handleEdit(null)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Evolução
        </Button>
      </div>

      <DataTable columns={columns} data={evolutionEntries} />

      {/* Modal/Dialog para Adicionar/Editar */}
      <Dialog open={isFormOpen} onOpenChange={(isOpen) => !isOpen && closeAll()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvolution ? "Editar Evolução" : "Nova Evolução"}
            </DialogTitle>
          </DialogHeader>
          <EvolutionEntryForm
            patientId={patientId}
            initialData={selectedEvolution}
            onSuccess={closeAll}
            doctors={doctors}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Visualizar Detalhes */}
      <Dialog open={isViewModalOpen} onOpenChange={(isOpen) => !isOpen && closeAll()}>
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
          <div className="prose dark:prose-invert max-w-none space-y-2 py-4">
            <div>
                <h4 className="font-semibold">Médico Responsável</h4>
                <p>{selectedEvolution?.doctor?.name ?? 'N/A'}</p>
            </div>
            <div>
                <h4 className="font-semibold">Descrição</h4>
                <p>{selectedEvolution?.description}</p>
            </div>
            <div>
                <h4 className="font-semibold">Observações</h4>
                <p>{selectedEvolution?.observations || "Nenhuma observação."}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerta de Confirmação para Deletar */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={(isOpen) => !isOpen && closeAll()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá deletar permanentemente o registro de evolução.
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