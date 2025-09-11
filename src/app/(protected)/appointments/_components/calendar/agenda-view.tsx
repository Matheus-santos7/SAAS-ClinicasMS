"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import type { Event as RBCEvent } from "react-big-calendar";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import { toast } from "sonner";

import { updateAppointmentDate } from "@/actions/update-appointment-date";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

// Configuração do localizador para o dayjs
const localizer = dayjsLocalizer(dayjs);

// Tipagem para os agendamentos com as relações
type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
};

interface AgendaViewProps {
  appointments: AppointmentWithRelations[];
}

export default function AgendaView({ appointments }: AgendaViewProps) {
  const router = useRouter();

  // Mapeia os nossos agendamentos para o formato que a biblioteca espera
  const events = appointments.map((appointment) => ({
    title: `${appointment.patient.name} - Dr(a). ${appointment.doctor.name}`,
    start: dayjs(appointment.date).toDate(),
    end: dayjs(appointment.date).add(30, "minute").toDate(), // Assumindo 30 min de duração
    resource: appointment as AppointmentWithRelations, // Cast para garantir o tipo correto
  }));
  // Função para estilizar os eventos com a cor do médico

  const eventPropGetter = (event: RBCEvent) => {
    // resource may be unknown, so we need to safely access doctor.color
    const resource = event.resource as AppointmentWithRelations | undefined;
    const backgroundColor = resource?.doctor?.color ?? "#3174ad";
    const style = {
      backgroundColor,
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style,
    };
  };

  // Função chamada quando um agendamento é arrastado e solto
  const handleEventDrop = ({
    event,
    start,
  }: {
    event: {
      title: string;
      start: Date;
      end: Date;
      resource?: unknown;
    };
    start: Date;
  }) => {
    const appointment = event.resource as AppointmentWithRelations;
    const appointmentId = appointment.id;

    const promise = updateAppointmentDate({
      id: appointmentId,
      date: start,
    });

    toast.promise(promise, {
      loading: "Reagendando...",
      success: (data) => {
        if (data && "success" in data) {
          router.refresh(); // Atualiza a página para refletir a mudança
        }
        return data && "success" in data
          ? String(data.success)
          : "Agendamento reagendado!";
      },
      error: (data) => data?.error || "Ocorreu um erro.",
    });
  };

  return (
    <div style={{ height: "70vh" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        culture="pt-BR"
        messages={{
          next: "Próximo",
          previous: "Anterior",
          today: "Hoje",
          month: "Mês",
          week: "Semana",
          day: "Dia",
        }}
        eventPropGetter={eventPropGetter}
        onEventDrop={handleEventDrop}
        selectable
        resizable
      />
    </div>
  );
}
