"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style.css";
import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useMemo } from "react";
import {
  Calendar,
  dayjsLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import AddAppointmentForm from "../add-appointment-form";
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
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
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

export default function AgendaView({
  appointments,
  patients,
  doctors,
}: AgendaViewProps) {
  const searchParams = useSearchParams();
  const { openModal, openNewModal, isNewModalOpen, closeNewModal } =
    useAppointmentStore();

  const doctorId = searchParams.get("doctorId");

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

  // Se necessário, implemente a atualização de evento via server action aqui
  const handleEventDrop = useCallback(async () => {
    /* no-op */
  }, []);

  const handleEventResize = useCallback(async () => {
    /* no-op */
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

  // --- Início: Nova função para criar agendamento ---
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
  // --- Fim: Nova função ---

  return (
    <>
      <AppointmentDetailsModal />

      {/* Passamos o estado e a função de fechar para o formulário de adição */}
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
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectEvent={handleSelectEvent}
          selectable // Permite a seleção de slots
          onSelectSlot={handleSelectSlot} // Callback para quando um slot é selecionado
          components={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: CustomEvent as unknown as React.ComponentType<any>,
          }}
        />
      </div>
    </>
  );
}
