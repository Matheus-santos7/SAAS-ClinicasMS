"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style.css";
import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks"; // Importar hook
import React, { useCallback, useMemo } from "react";
import {
  Calendar,
  dayjsLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import { toast } from "sonner";

import { updateAppointmentDate } from "@/actions/appointment/update-appointment-date"; // Importar action
import { Dialog } from "@/components/ui/dialog";
import { useAppointmentStore } from "@/stores";
import { AppointmentWithRelations, Doctor, Patient } from "@/types"; // Usar tipo centralizado

import AddAppointmentForm from "../add-appointment-form";
import { AppointmentDetailsModal } from "./appointment-details-modal";

dayjs.locale("pt-br");
const localizer = dayjsLocalizer(dayjs);

// ... (componente CustomEvent permanece o mesmo)

interface AgendaViewProps {
  appointments: AppointmentWithRelations[];
  patients: Patient[];
  doctors: Doctor[];
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
        {/* Badge removido pois não há campo status no schema */}
      </div>
      <p className="hidden truncate text-xs sm:block">
        Dr(a). {appointment.doctor.name}
      </p>
    </div>
  );
};

export default function AgendaView({
  appointments,
  patients,
  doctors,
}: AgendaViewProps) {
  const searchParams = useSearchParams();
  const { openModal, openNewModal, isNewModalOpen, closeNewModal } =
    useAppointmentStore();
  const doctorId = searchParams.get("doctorId");

  const { execute: executeUpdate } = useAction(updateAppointmentDate, {
    onSuccess: (data) => toast.success(data.data.success),
    onError: (error) =>
      toast.error(error.error?.serverError || "Falha ao reagendar."),
  });

  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: RBCEvent; start: Date; end: Date }) => {
      const resource = event.resource as {
        appointment: AppointmentWithRelations;
      };
      executeUpdate({ id: resource.appointment.id, date: start, endDate: end });
    },
    [executeUpdate],
  );

  const events = useMemo(
    () =>
      appointments.map((appointment) => ({
        title: `${appointment.patient.name} - Dr(a). ${appointment.doctor.name}`,
        start: dayjs(appointment.date).toDate(),
        end: dayjs(appointment.endDate).toDate(),
        resource: { appointment },
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

  const handleSelectEvent = useCallback(
    (event: RBCEvent) => {
      const resource = event.resource as {
        appointment: AppointmentWithRelations;
      };
      openModal(resource.appointment);
    },
    [openModal],
  );

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (!doctorId || doctorId === "all") {
        toast.error("Por favor, selecione um dentista para agendar.");
        return;
      }
      openNewModal({ start, end });
    },
    [openNewModal, doctorId],
  );

  return (
    <>
      <AppointmentDetailsModal />
      <Dialog
        open={isNewModalOpen}
        onOpenChange={(open) => !open && closeNewModal()}
      >
        <AddAppointmentForm
          isOpen={isNewModalOpen}
          patients={patients}
          doctors={doctors}
          onSuccess={closeNewModal}
        />
      </Dialog>
      <div className="bg-card relative h-[80vh] max-w-full overflow-x-auto rounded-lg border p-4 sm:p-2 md:p-4">
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
          onSelectEvent={handleSelectEvent}
          selectable
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop} // <-- Habilitado
          resizable // <-- Habilitado
          onEventResize={handleEventDrop} // Reutiliza a mesma lógica
          components={{
            event: CustomEvent as React.ComponentType<{
              event: { resource: { appointment: AppointmentWithRelations } };
            }>,
          }}
        />
      </div>
    </>
  );
}
