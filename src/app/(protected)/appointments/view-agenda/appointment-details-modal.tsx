"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  Stethoscope,
  XCircleIcon,
  Trash2,
  UserIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteAppointment } from "@/actions/appointment/delete-appointment";
import { updateAppointmentStatus } from "@/actions/appointment/update-appointment-status";
import { updateAppointment } from "@/actions/appointment/update-appointment";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrencyInCents } from "@/helpers/currency";
import { useAppointmentStore } from "@/stores";

const formSchema = z.object({
  date: z.date({ required_error: "Data é obrigatória." }),
  startTime: z
    .string()
    .min(1, { message: "Horário de início é obrigatório." }),
  endTime: z
    .string()
    .min(1, { message: "Horário de término é obrigatório." }),
  observations: z
    .string()
    .max(1000, { message: "Observações deve ter no máximo 1000 caracteres." })
    .optional()
    .nullable(),
  status: z.enum(["pending", "confirmed", "canceled", "completed"]),
});

export const AppointmentDetailsModal = () => {
  const { isModalOpen, isViewModal, getSelectedAppointment, closeModal } =
    useAppointmentStore();

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteAppointment,
    {
      onSuccess: () => {
        toast.success("Agendamento excluído com sucesso.");
        closeModal();
      },
      onError: (error) => {
        toast.error(
          error.error.serverError || "Erro ao excluir agendamento.",
        );
      },
    },
  );

  const {
    execute: executeCancel,
    isPending: isCanceling,
  } = useAction(updateAppointmentStatus, {
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso.");
      closeModal();
    },
    onError: (error) => {
      toast.error(
        error.error.serverError || "Erro ao cancelar agendamento.",
      );
    },
  });

  const {
    execute: executeUpdate,
    isPending: isUpdating,
    reset: resetUpdate,
  } = useAction(updateAppointment, {
    onSuccess: (result) => {
      const data = (result as any)?.data ?? result;
      if (data?.errorMessage) {
        toast.error(data.errorMessage);
        return;
      }
      toast.success("Agendamento atualizado com sucesso.");
      closeModal();
      resetUpdate();
    },
    onError: (error) => {
      const anyError = error as any;
      const message =
        anyError.serverError ||
        anyError.error?.serverError ||
        anyError.fetchError ||
        anyError.message ||
        "Erro ao atualizar agendamento.";
      toast.error(message);
    },
  });

  const selectedAppointment = getSelectedAppointment();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: selectedAppointment
      ? {
          date: dayjs(selectedAppointment.date).toDate(),
          startTime: dayjs(selectedAppointment.date).format("HH:mm"),
          endTime: dayjs(selectedAppointment.endDate).format("HH:mm"),
          observations: selectedAppointment.observations ?? "",
          status: selectedAppointment.status ?? "pending",
        }
      : undefined,
  });

  if (
    !isModalOpen ||
    !isViewModal() ||
    !selectedAppointment ||
    !selectedAppointment.patient ||
    !selectedAppointment.doctor
  ) {
    return null;
  }

  const { patient, doctor, date, endDate } = selectedAppointment;

  const formattedDateTime = `${dayjs(date)
    .locale("pt-br")
    .format("dddd, DD [de] MMMM")} · ${dayjs(date)
    .locale("pt-br")
    .format("HH:mm")} - ${dayjs(endDate).locale("pt-br").format("HH:mm")}`;

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    executeUpdate({
      id: selectedAppointment.id,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      observations: values.observations,
      status: values.status,
    });
  };

  return (
    <Dialog open={isModalOpen && isViewModal()} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            <CalendarIcon className="text-primary h-5 w-5" />
          </div>
          <DialogTitle className="text-foreground text-xl font-bold">
            {patient.name}
          </DialogTitle>
        </DialogHeader>
        <p className="mt-1 text-base font-semibold text-foreground capitalize">
          <ClockIcon className="mr-2 inline-block h-4 w-4 align-middle" />
          <span className="align-middle">{formattedDateTime}</span>
        </p>

        <div className="py-4">
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Stethoscope className="text-muted-foreground h-5 w-5" />
              <span className="text-foreground">Dr(a). {doctor.name}</span>
            </div>
            {patient.email?.trim() && (
              <div className="flex items-center gap-3">
                <UserIcon className="text-muted-foreground h-5 w-5" />
                <span className="text-foreground">{patient.email}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="sm:w-1/3">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? dayjs(field.value).format("YYYY-MM-DD")
                              : ""
                          }
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? dayjs(e.target.value).toDate()
                                : undefined,
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-1 gap-3">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hora início</FormLabel>
                      <FormControl>
                        <Input type="time" step={900} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Hora fim</FormLabel>
                      <FormControl>
                        <Input type="time" step={900} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Anote observações importantes sobre este agendamento (opcional)"
                    {...field}
                    value={field.value ?? ""}
                  />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status do agendamento</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="canceled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-amber-600 hover:text-amber-600"
                      title="Cancelar agendamento"
                      aria-label="Cancelar agendamento"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Cancelar agendamento?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O agendamento
                        será marcado como <strong>Cancelado</strong>.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Não</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          executeCancel({
                            id: selectedAppointment.id,
                            status: "canceled",
                          })
                        }
                        disabled={isCanceling}
                      >
                        {isCanceling ? "Cancelando..." : "Confirmar cancelamento"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      title="Excluir agendamento"
                      aria-label="Excluir agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Excluir agendamento?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. O agendamento será
                        removido das telas.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          executeDelete({ id: selectedAppointment.id })
                        }
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={isUpdating}
                >
                  Fechar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <PencilIcon className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Salvar alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
