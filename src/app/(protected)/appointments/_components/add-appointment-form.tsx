"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addAppointment } from "@/actions/appointment/add-appointment";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { doctorsTable, patientsTable } from "@/db/schema";

import { useAppointmentStore } from "./view-agenda/appointment-store"; // Importação atualizada

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  date: z.date({
    required_error: "Data é obrigatória.",
  }),
  time: z.string().min(1, {
    message: "Horário é obrigatório.",
  }),
});

interface AddAppointmentFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const AddAppointmentForm = ({
  isOpen,
  patients: _patients, // eslint-disable-line @typescript-eslint/no-unused-vars
  doctors: _doctors, // eslint-disable-line @typescript-eslint/no-unused-vars
  onSuccess,
}: AddAppointmentFormProps) => {
  const { newAppointmentSlot } = useAppointmentStore();
  const searchParams = useSearchParams();
  const doctorIdFromUrl = searchParams.get("doctorId");

  // Caso seja necessário popular selects: buscar pacientes/médicos na página e passar como props.

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: doctorIdFromUrl || "",
      date: newAppointmentSlot?.start,
      time: newAppointmentSlot?.start
        ? dayjs(newAppointmentSlot.start).format("HH:mm:ss")
        : "",
    },
  });

  // Efeito para preencher o formulário quando um slot é selecionado
  useEffect(() => {
    if (newAppointmentSlot && isOpen) {
      form.reset({
        patientId: "",
        doctorId: doctorIdFromUrl || "",
        date: newAppointmentSlot.start,
        time: dayjs(newAppointmentSlot.start).format("HH:mm:ss"),
      });
    }
  }, [newAppointmentSlot, isOpen, doctorIdFromUrl, form]);

  const createAppointmentAction = useAction(addAppointment, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao criar agendamento.");
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!newAppointmentSlot) return; // Segurança

    createAppointmentAction.execute({
      ...values,
    });
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Crie um novo agendamento para sua clínica.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ... os campos do formulário (patientId, doctorId, date, time) ... */}
          {/* Não farei alterações nos campos em si, apenas na lógica de preenchimento */}

          <DialogFooter>
            <Button type="submit" disabled={createAppointmentAction.isPending}>
              {createAppointmentAction.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Criar agendamento"
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddAppointmentForm;
