"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { CalendarDays, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addAppointment } from "@/actions/appointment/add-appointment";
import UpsertPatientForm from "@/app/(protected)/patients/_components/upsert-patient-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { centsToReaisInput, parseReaisToCents } from "@/helpers/currency";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";
import { useAppointmentStore } from "@/stores";
import { ClinicProcedure, Doctor, Patient } from "@/types";

const formSchema = z
  .object({
    patientId: z.string().min(1, { message: "Paciente é obrigatório." }),
    doctorId: z.string().min(1, { message: "Dentista é obrigatório." }),
    appointmentPriceReais: z
      .string()
      .min(1, { message: "Informe o valor da consulta." }),
    date: z.date({ required_error: "Data é obrigatória." }),
    startTime: z
      .string()
      .min(1, { message: "Horário de início é obrigatório." }),
    endTime: z
      .string()
      .min(1, { message: "Horário de término é obrigatório." }),
    clinicProcedureId: z.string().optional(),
    observations: z
      .string()
      .max(1000, { message: "Observações deve ter no máximo 1000 caracteres." })
      .optional()
      .nullable(),
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

interface AddAppointmentFormProps {
  isOpen: boolean;
  patients: Patient[];
  doctors: Doctor[];
  clinicProcedures: ClinicProcedure[];
  onSuccess?: () => void;
}

const AddAppointmentForm = ({
  isOpen,
  patients,
  doctors,
  clinicProcedures,
  onSuccess,
}: AddAppointmentFormProps) => {
  const { getNewAppointmentSlot } = useAppointmentStore();
  const searchParams = useSearchParams();
  const doctorIdFromUrl = searchParams.get("doctorId");
  const newAppointmentSlot = getNewAppointmentSlot();
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);

  const initialDoctor = doctors.find((d) => d.id === (doctorIdFromUrl || ""));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: doctorIdFromUrl || "",
      appointmentPriceReais: initialDoctor
        ? centsToReaisInput(initialDoctor.appointmentPriceInCents)
        : "",
      date: newAppointmentSlot?.start
        ? dayjs(newAppointmentSlot.start).startOf("day").toDate()
        : undefined,
      startTime: newAppointmentSlot?.start
        ? dayjs(newAppointmentSlot.start).format("HH:mm")
        : "",
      endTime: newAppointmentSlot?.end
        ? dayjs(newAppointmentSlot.end).format("HH:mm")
        : "",
      clinicProcedureId: "__none__",
      observations: "",
    },
  });

  useEffect(() => {
    if (newAppointmentSlot && isOpen) {
      form.reset({
        patientId: "",
        doctorId: doctorIdFromUrl || "",
        appointmentPriceReais: (() => {
          const d = doctors.find((x) => x.id === (doctorIdFromUrl || ""));
          return d ? centsToReaisInput(d.appointmentPriceInCents) : "";
        })(),
        date: dayjs(newAppointmentSlot.start).startOf("day").toDate(),
        startTime: dayjs(newAppointmentSlot.start).format("HH:mm"),
        endTime: newAppointmentSlot.end
          ? dayjs(newAppointmentSlot.end).format("HH:mm")
          : "",
        clinicProcedureId: "__none__",
        observations: "",
      });
    }
  }, [newAppointmentSlot, isOpen, doctorIdFromUrl, doctors, form]);

  const createAppointmentAction = useAction(addAppointment, {
    onSuccess: (result) => {
      const data = (result as any)?.data ?? result;

      if (data?.errorMessage) {
        toast.error(data.errorMessage);
        return;
      }

      toast.success("Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: (error) => {
      const anyError = error as any;
      const message =
        anyError.serverError ||
        anyError.error?.serverError ||
        anyError.fetchError ||
        anyError.message ||
        "Erro ao criar agendamento.";

      if (process.env.NODE_ENV !== "production") {
         
        console.error("Erro ao criar agendamento:", anyError);
      }

      toast.error(message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!newAppointmentSlot) return;

    createAppointmentAction.execute({
      patientId: values.patientId,
      doctorId: values.doctorId,
      appointmentPriceReais: values.appointmentPriceReais,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      observations: values.observations,
      clinicProcedureId:
        values.clinicProcedureId &&
        values.clinicProcedureId !== "__none__"
          ? values.clinicProcedureId
          : undefined,
    });
  };

  if (!patients.length || !doctors.length) {
    return <DialogContent>Nenhum paciente ou Dentista disponível.</DialogContent>;
  }

  return (
    <DialogContent
      className={cn(
        "flex max-h-[min(92vh,760px)] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0",
        "left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]",
        "sm:max-w-lg sm:rounded-xl sm:shadow-xl",
      )}
    >
      <div className="bg-muted/35 shrink-0 border-b px-6 pb-5 pt-6 pr-14">
        <DialogHeader className="space-y-3 text-left">
          <div className="flex items-start gap-4">
            <div className="bg-primary/12 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
              <CalendarDays className="text-primary h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <DialogTitle className="text-xl font-semibold leading-tight tracking-tight">
                Novo agendamento
              </DialogTitle>
              <DialogDescription className="text-base leading-snug">
                Defina paciente, horário e valor. O tipo de tratamento é opcional
                para classificar o atendimento.
              </DialogDescription>
            </div>
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
                Paciente e profissional
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paciente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            aria-label="Selecionar paciente"
                            className="bg-background"
                          >
                            <SelectValue placeholder="Selecione um paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                          <Dialog
                            open={isPatientDialogOpen}
                            onOpenChange={setIsPatientDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                className="mt-2 w-full justify-start gap-2 border-t pt-2 text-xs font-normal text-primary"
                                onClick={() => setIsPatientDialogOpen(true)}
                              >
                                <Plus className="h-3 w-3" />
                                Cadastrar novo paciente
                              </Button>
                            </DialogTrigger>
                            <UpsertPatientForm
                              isOpen={isPatientDialogOpen}
                              onSuccess={() => setIsPatientDialogOpen(false)}
                              preventOutsideClose
                            />
                          </Dialog>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dentista</FormLabel>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          const d = doctors.find((x) => x.id === v);
                          if (d) {
                            form.setValue(
                              "appointmentPriceReais",
                              centsToReaisInput(d.appointmentPriceInCents),
                            );
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            aria-label="Selecionar Dentista"
                            className="bg-background"
                          >
                            <SelectValue placeholder="Selecione um Dentista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              {doctor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                Valor e tipo
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
                      <FormLabel>Tipo de tratamento (opcional)</FormLabel>
                      {clinicProcedures.length > 0 ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger
                              aria-label="Tipo de tratamento"
                              className="bg-background"
                            >
                              <SelectValue placeholder="Sem tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">Sem tipo</SelectItem>
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
                          </Link>{" "}
                          para classificar o atendimento.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
                Data e horário
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
                      placeholder="Opcional — anotações sobre o agendamento"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-background/95 shrink-0 border-t px-6 py-4 backdrop-blur-sm">
            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                aria-label="Cancelar criação de agendamento"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createAppointmentAction.isPending}
                className="min-w-[140px]"
              >
                {createAppointmentAction.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar agendamento"
                )}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddAppointmentForm;
