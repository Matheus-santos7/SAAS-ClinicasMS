"use client";

import "dayjs/locale/pt-br";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import {
  CalendarIcon,
  ClockIcon,
  PencilIcon,
  Stethoscope,
  Trash2,
  UserIcon,
  XCircleIcon,
} from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { deleteAppointment } from "@/actions/appointment/delete-appointment";
import { updateAppointment } from "@/actions/appointment/update-appointment";
import { updateAppointmentStatus } from "@/actions/appointment/update-appointment-status";
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
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import {
  centsToReaisInput,
  parseReaisToCents,
} from "@/helpers/currency";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useAppointmentStore } from "@/stores";
import type { ClinicProcedure } from "@/types";

const PROCEDURE_NONE = "__none__";

const formSchema = z
  .object({
    date: z.date({ required_error: "Data é obrigatória." }),
    startTime: z
      .string()
      .min(1, { message: "Horário de início é obrigatório." }),
    endTime: z
      .string()
      .min(1, { message: "Horário de término é obrigatório." }),
    appointmentPriceReais: z
      .string()
      .min(1, { message: "Informe o valor da consulta." }),
    observations: z
      .string()
      .max(1000, { message: "Observações deve ter no máximo 1000 caracteres." })
      .optional()
      .nullable(),
    clinicProcedureId: z.string(),
    status: z.enum(["pending", "confirmed", "canceled", "completed"]),
  })
  .superRefine((data, ctx) => {
    if (parseReaisToCents(data.appointmentPriceReais) < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor inválido.",
        path: ["appointmentPriceReais"],
      });
    }
  });

type AppointmentDetailsModalProps = {
  clinicProcedures: ClinicProcedure[];
};

export const AppointmentDetailsModal = ({
  clinicProcedures,
}: AppointmentDetailsModalProps) => {
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
          appointmentPriceReais: centsToReaisInput(
            selectedAppointment.appointmentPriceInCents,
          ),
          observations: selectedAppointment.observations ?? "",
          clinicProcedureId:
            selectedAppointment.clinicProcedureId ?? PROCEDURE_NONE,
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
      appointmentPriceReais: values.appointmentPriceReais,
      observations: values.observations,
      clinicProcedureId:
        values.clinicProcedureId === PROCEDURE_NONE
          ? ""
          : values.clinicProcedureId,
      status: values.status,
    });
  };

  return (
    <Dialog open={isModalOpen && isViewModal()} onOpenChange={closeModal}>
      <DialogContent
        className={cn(
          "flex max-h-[min(92vh,760px)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0",
          "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
          "sm:max-w-xl sm:rounded-xl sm:shadow-xl",
        )}
      >
        <div className="bg-muted/35 shrink-0 border-b px-6 pb-5 pt-6 pr-14">
          <DialogHeader className="space-y-4 text-left">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="bg-primary/12 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                <CalendarIcon className="text-primary h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <DialogTitle className="text-foreground text-xl font-semibold leading-tight tracking-tight">
                  {patient.name}
                </DialogTitle>
                <DialogDescription className="text-foreground/90 flex items-start gap-2 text-sm font-medium leading-snug">
                  <ClockIcon className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
                  <span className="capitalize">{formattedDateTime}</span>
                </DialogDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="bg-background/90 text-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm shadow-sm">
                <Stethoscope className="text-muted-foreground h-4 w-4" />
                Dr(a). {doctor.name}
              </span>
              {selectedAppointment.clinicProcedure ? (
                <span className="bg-background/90 text-foreground inline-flex items-center rounded-full border px-3 py-1.5 text-sm shadow-sm">
                  {selectedAppointment.clinicProcedure.name}
                </span>
              ) : null}
              {patient.email?.trim() ? (
                <span className="text-muted-foreground inline-flex items-center gap-2 rounded-full border border-dashed px-3 py-1.5 text-sm">
                  <UserIcon className="h-4 w-4" />
                  {patient.email}
                </span>
              ) : null}
            </div>
          </DialogHeader>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 py-5">
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                  Horário
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="bg-background"
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
                  <div className="grid grid-cols-2 gap-3 sm:col-span-8 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Início</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              step={900}
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Término</FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              step={900}
                              className="bg-background"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                  Valor e classificação
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="appointmentPriceReais"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da consulta (R$)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-background font-medium tabular-nums"
                            inputMode="decimal"
                            placeholder="0,00"
                            autoComplete="off"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="clinicProcedureId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de tratamento</FormLabel>
                        {clinicProcedures.length > 0 ? (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Sem tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={PROCEDURE_NONE}>
                                Sem tipo
                              </SelectItem>
                              {clinicProcedures.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-muted-foreground text-xs leading-relaxed">
                            Cadastre procedimentos em{" "}
                            <Link
                              href={`${ROUTES.REGISTRY}?tab=procedimentos`}
                              className="text-primary font-medium underline underline-offset-2"
                            >
                              Cadastros
                            </Link>
                            .
                          </p>
                        )}
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
                        className="bg-background resize-none"
                        placeholder="Opcional — anotações sobre este agendamento"
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background w-full sm:max-w-xs">
                          <SelectValue placeholder="Status" />
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
            </div>

            <div className="bg-background/95 shrink-0 border-t px-6 py-4 backdrop-blur-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-amber-600 hover:bg-amber-500/10 hover:text-amber-600"
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
                          Esta ação não pode ser desfeita. O agendamento será
                          marcado como <strong>Cancelado</strong>.
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
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Excluir agendamento"
                        aria-label="Excluir agendamento"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
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

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeModal}
                    disabled={isUpdating}
                  >
                    Fechar
                  </Button>
                  <Button type="submit" disabled={isUpdating} className="min-w-[140px]">
                    {isUpdating ? (
                      <>
                        <PencilIcon className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <PencilIcon className="mr-2 h-4 w-4" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
