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
import { useAppointmentStore } from "@/stores";
import { Doctor, Patient } from "@/types";

const formSchema = z.object({
  patientId: z.string().min(1, { message: "Paciente é obrigatório." }),
  doctorId: z.string().min(1, { message: "Médico é obrigatório." }),
  date: z.date({ required_error: "Data é obrigatória." }),
  startTime: z.string().min(1, { message: "Horário de início é obrigatório." }),
  endTime: z.string().min(1, { message: "Horário de término é obrigatório." }),
});

interface AddAppointmentFormProps {
  isOpen: boolean;
  patients: Patient[];
  doctors: Doctor[];
  onSuccess?: () => void;
}

const AddAppointmentForm = ({
  isOpen,
  patients,
  doctors,
  onSuccess,
}: AddAppointmentFormProps) => {
  const { getNewAppointmentSlot } = useAppointmentStore();
  const searchParams = useSearchParams();
  const doctorIdFromUrl = searchParams.get("doctorId");
  const newAppointmentSlot = getNewAppointmentSlot();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: doctorIdFromUrl || "",
      date: newAppointmentSlot?.start,
      startTime: newAppointmentSlot?.start
        ? dayjs(newAppointmentSlot.start).format("HH:mm")
        : "",
      endTime: newAppointmentSlot?.end
        ? dayjs(newAppointmentSlot.end).format("HH:mm")
        : "",
    },
  });

  useEffect(() => {
    if (newAppointmentSlot && isOpen) {
      form.reset({
        patientId: "",
        doctorId: doctorIdFromUrl || "",
        date: newAppointmentSlot.start,
        startTime: dayjs(newAppointmentSlot.start).format("HH:mm"),
        endTime: newAppointmentSlot.end
          ? dayjs(newAppointmentSlot.end).format("HH:mm")
          : "",
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
    if (!newAppointmentSlot) return;

    createAppointmentAction.execute({
      patientId: values.patientId,
      doctorId: values.doctorId,
      date: values.date,
      startTime: values.startTime,
      endTime: values.endTime,
      // outros campos se necessário
    });
  };

  if (!patients.length || !doctors.length) {
    return <DialogContent>Nenhum paciente ou médico disponível.</DialogContent>;
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Novo agendamento</DialogTitle>
        <DialogDescription>
          Crie um novo agendamento para sua clínica.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        {/* ...campos existentes... */}
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de início</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
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
              <FormLabel>Horário de término</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <SelectTrigger aria-label="Selecionar paciente">
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
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
                <FormLabel>Médico</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger aria-label="Selecionar médico">
                      <SelectValue placeholder="Selecione um médico" />
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
                      field.value ? dayjs(field.value).format("YYYY-MM-DD") : ""
                    }
                    onChange={(e) => field.onChange(new Date(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              aria-label="Cancelar criação de agendamento"
            >
              Cancelar
            </Button>
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
