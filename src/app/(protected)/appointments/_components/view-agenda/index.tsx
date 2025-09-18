"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style.css";
import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
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

dayjs.locale("pt-br");
const localizer = dayjsLocalizer(dayjs);

export type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: typeof patientsTable.$inferSelect;
  doctor: typeof doctorsTable.$inferSelect;
  status: string;
};

interface AgendaViewProps {
  appointments: AppointmentWithRelations[];
}

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
        end: dayjs(appointment.endDate).toDate(),
        resource: {
          appointment,
        },
      })),
    [appointments],
  );

  const eventPropGetter = useCallback((event: RBCEvent) => {
    const resource = event.resource as {
      appointment: AppointmentWithRelations;
    };
    const backgroundColor = resource.appointment.doctor?.color || "#3174ad";
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
      <div className="bg-card relative h-[80vh] max-w-full overflow-x-auto rounded-lg border p-4 sm:p-2 md:p-4">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
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
            event: CustomEvent as React.ComponentType<CustomEventProps>,
          }}
        />
      </div>
    </>
  );
}