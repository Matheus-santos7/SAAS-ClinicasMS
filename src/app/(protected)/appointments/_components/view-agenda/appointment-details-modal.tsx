"use client";

import {
  CalendarIcon,
  ClockIcon,
  DollarSignIcon,
  Edit,
  Stethoscope,
  Trash2,
  UserIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteAppointment } from "@/actions/appointment/delete-appointment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatCurrencyInCents } from "@/helpers/currency";
import { useAppointmentStore } from "@/stores";

export const AppointmentDetailsModal = () => {
  const { isModalOpen, selectedAppointment, closeModal } =
    useAppointmentStore();

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteAppointment,
    {
      onSuccess: () => {
        toast.success("Agendamento deletado com sucesso.");
        closeModal();
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Erro ao deletar agendamento.");
      },
    },
  );

  const handleDelete = () => {
    if (selectedAppointment) {
      executeDelete({ id: selectedAppointment.id });
    }
  };

  if (!selectedAppointment) {
    return null;
  }

  const { patient, doctor, date, endDate, appointmentPriceInCents } =
    selectedAppointment;

  const formattedDate = new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = `${new Date(date).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${new Date(endDate).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <CalendarIcon className="text-primary h-5 w-5" />
          </div>
          <DialogTitle className="text-foreground text-xl font-bold">
            {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <ClockIcon className="text-muted-foreground h-5 w-5" />
              <div className="flex flex-col">
                <span className="text-foreground font-medium">
                  {formattedDate}
                </span>
                <span className="text-muted-foreground">{formattedTime}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Stethoscope className="text-muted-foreground h-5 w-5" />
              <span className="text-foreground">Dr(a). {doctor.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <UserIcon className="text-muted-foreground h-5 w-5" />
              <span className="text-foreground">{patient.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <DollarSignIcon className="text-muted-foreground h-5 w-5" />
              <span className="text-foreground">
                {formatCurrencyInCents(appointmentPriceInCents)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end gap-2 pt-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" title="Excluir">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Agendamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O agendamento será removido
                  permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="icon" title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};