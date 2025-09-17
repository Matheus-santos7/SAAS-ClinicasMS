// src/app/(protected)/appointments/_components/calendar/agenda-view.tsx
"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./agenda-view.css"; // Continuamos a usar o nosso CSS customizado
import "dayjs/locale/pt-br"; // Importe a localização para o Dayjs

import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  dayjsLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import { toast } from "sonner";

import { updateAppointmentDate } from "@/actions/appointment/update-appointment-date";
import { Badge } from "@/components/ui/badge";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { AppointmentDetailsModal } from "./appointment-details-modal";
import { useAppointmentStore } from "./appointment-store";

dayjs.locale("pt-br"); // Configure o Dayjs para usar português
const localizer = dayjsLocalizer(dayjs);

export type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
  status: string; // Add this line if 'status' is not present in appointmentsTable
};

interface AgendaViewProps {
  appointments: AppointmentWithRelations[];
}

// Componente customizado para renderizar o evento

// Componente customizado para renderizar o evento
// Define the type for the event prop expected by CustomEvent
type CustomEventProps = {
  event: {
    resource: {
      appointment: AppointmentWithRelations;
    };
  };
};

const CustomEvent = (props: CustomEventProps) => {
  const { event } = props;
  const { appointment } = event.resource;
  return (
    <div className="flex h-full flex-col overflow-hidden p-1 text-white">
      <div className="flex items-center gap-2">
        <p className="truncate font-semibold">{appointment.patient.name}</p>
        <Badge
          variant={appointment.status === "confirmed" ? "default" : "secondary"}
          className="text-xs"
        >
          {appointment.status === "confirmed" ? "Confirmado" : "Pendente"}
        </Badge>
      </div>
      <p className="hidden truncate text-xs sm:block">
        Dr(a). {appointment.doctor.name}
      </p>
    </div>
  );
};

export default function AgendaView({ appointments }: AgendaViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { openModal } = useAppointmentStore();

  const events = useMemo(
    () =>
      appointments.map((appointment) => ({
        title: `${appointment.patient.name} - Dr(a). ${appointment.doctor.name}`,
        start: dayjs(appointment.date).toDate(),
        end: dayjs(appointment.date).add(30, "minute").toDate(),
        resource: {
          appointment,
        },
      })),
    [appointments],
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const eventPropGetter = useCallback((event: any) => {
    const backgroundColor =
      event.resource?.appointment?.doctor?.color || "#3174ad";
    return {
      style: {
        backgroundColor,
        borderRadius: "5px",
        borderColor: "transparent",
        opacity: 0.9,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  }, []);

  const handleEventDrop = useCallback(
    async (args: { event: RBCEvent; start: Date; end: Date }) => {
      setLoading(true);
      const resource = args.event.resource as {
        appointment: AppointmentWithRelations;
      };
      const appointmentId = resource.appointment.id;

      const promise = updateAppointmentDate({
        id: appointmentId,
        date: args.start,
        endDate: args.end,
      });

      toast.promise(promise, {
        loading: "Reagendando consulta...",
        success: () => {
          setLoading(false);
          router.refresh();
          return "Consulta reagendada com sucesso!";
        },
        error: (err) => {
          setLoading(false);
          return `Erro ao reagendar: ${err.message}`;
        },
      });
    },
    [router],
  );

  const handleEventResize = useCallback(
    async (args: { event: RBCEvent; start: Date; end: Date }) => {
      setLoading(true);
      const resource = args.event.resource as {
        appointment: AppointmentWithRelations;
      };
      const appointmentId = resource.appointment.id;

      // Usamos a mesma action, mas passamos apenas o que mudou
      const promise = updateAppointmentDate({
        id: appointmentId,
        endDate: args.end,
      });

      toast.promise(promise, {
        loading: "Atualizando duração...",
        success: () => {
          setLoading(false);
          router.refresh();
          return "Duração atualizada com sucesso!";
        },
        error: (err) => {
          setLoading(false);
          return `Erro ao atualizar: ${err.message}`;
        },
      });
    },
    [router],
  );

  const handleSelectEvent = useCallback(
    (event: RBCEvent) => {
      const resource = event.resource as {
        appointment: AppointmentWithRelations;
      };
      openModal(resource.appointment);
    },
    [openModal],
  );

  return (
    <>
      <AppointmentDetailsModal />
      <div className="bg-card relative h-[75vh] max-w-full overflow-x-auto rounded-lg border p-4 sm:p-2 md:p-4">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <svg
              className="h-8 w-8 animate-spin text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label="Carregando"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41M17.66 17.66l-1.41-1.41M6.34 6.34L4.93 7.75"
              />
            </svg>
          </div>
        )}
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          culture="pt-br"
          views={["month", "week", "day"]}
          defaultView="week"
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há agendamentos neste período.",
          }}
          eventPropGetter={eventPropGetter}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectEvent={handleSelectEvent}
          selectable
          resizable
          components={{
            event: CustomEvent,
          }}
        />
      </div>
    </>
  );
}
