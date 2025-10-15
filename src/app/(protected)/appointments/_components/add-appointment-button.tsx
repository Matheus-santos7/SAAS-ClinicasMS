"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useAppointmentStore } from "@/stores";
import { Doctor, Patient } from "@/types";

import AddAppointmentForm from "./add-appointment-form";

interface AddAppointmentButtonProps {
  patients: Patient[];
  doctors: Doctor[];
}

const AddAppointmentButton = ({
  patients,
  doctors,
}: AddAppointmentButtonProps) => {
  const { openCreateModal, isModalOpen, isCreateModal, closeModal } =
    useAppointmentStore();

  if (!patients.length || !doctors.length) {
    return null; // Ou exibir uma mensagem
  }

  const handleOpenModal = () => {
    // Data padrão: pode ser ajustada conforme a lógica de negócios
    openCreateModal({
      start: new Date(),
      end: new Date(Date.now() + 30 * 60 * 1000),
    });
  };

  return (
    <Dialog
      open={isModalOpen && isCreateModal()}
      onOpenChange={(open) => !open && closeModal()}
    >
      <DialogTrigger asChild>
        <Button onClick={handleOpenModal} aria-label="Criar novo agendamento">
          <Plus className="mr-2 h-4 w-4" />
          Novo agendamento
        </Button>
      </DialogTrigger>
      <AddAppointmentForm
        isOpen={isModalOpen && isCreateModal()}
        patients={patients}
        doctors={doctors}
        onSuccess={closeModal}
      />
    </Dialog>
  );
};

export default AddAppointmentButton;
