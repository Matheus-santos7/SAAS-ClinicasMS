"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import React, { useCallback, useMemo } from "react";
import {
  Calendar,
  dayjsLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import { toast } from "sonner";

import { updateAppointmentDate } from "@/actions/appointment/update-appointment-date";
import { Dialog } from "@/components/ui/dialog";
import { APP_CONFIG } from "@/constants/config";
import {
  getAppointmentStyle,
  getValidDoctorColor,
} from "@/helpers/doctor-colors";
import { useAppointmentStore } from "@/stores";
import { AppointmentWithRelations, Doctor, Patient } from "@/types";

import AddAppointmentForm from "../_components/add-appointment-form";
import { AppointmentDetailsModal } from "./appointment-details-modal";

dayjs.locale("pt-br");
const localizer = dayjsLocalizer(dayjs);

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
        <p
          className="truncate font-semibold"
          title={appointment.patient.name}
          aria-label={`Paciente: ${appointment.patient.name}`}
        >
          {appointment.patient.name}
        </p>
      </div>
      <p
        className="hidden truncate text-xs sm:block"
        title={`Dr(a). ${appointment.doctor.name}`}
        aria-label={`Médico: ${appointment.doctor.name}`}
      >
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
  const {
    openViewModal,
    openCreateModal,
    isModalOpen,
    closeModal,
    isCreateModal,
  } = useAppointmentStore();
  const doctorId = searchParams.get("doctorId");

  const { execute: executeUpdate } = useAction(updateAppointmentDate, {
    onSuccess: (data) =>
      toast.success(data.data.success || "Agendamento atualizado com sucesso."),
    onError: (error) =>
      toast.error(error.error?.serverError || "Falha ao reagendar."),
  });

  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: RBCEvent; start: Date; end: Date }) => {
      const resource = event.resource as {
        appointment?: AppointmentWithRelations;
      };
      if (!resource?.appointment) {
        toast.error("Erro: Agendamento inválido.");
        return;
      }
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
      appointment?: AppointmentWithRelations;
    };
    if (!resource?.appointment?.doctor) {
      return { style: { opacity: 0.9, display: "block" } };
    }
    const doctorColor = getValidDoctorColor(resource.appointment.doctor.color);
    return {
      style: {
        ...getAppointmentStyle(doctorColor),
        opacity: 0.9,
        display: "block",
      },
    };
  }, []);

  const handleSelectEvent = useCallback(
    (event: RBCEvent) => {
      const resource = event.resource as {
        appointment?: AppointmentWithRelations;
      };
      if (!resource?.appointment) {
        toast.error("Erro: Agendamento inválido.");
        return;
      }
      openViewModal(resource.appointment);
    },
    [openViewModal],
  );

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      openCreateModal({ start, end });
    },
    [openCreateModal, doctorId, doctors],
  );

  if (!appointments || !patients.length || !doctors.length) {
    return <div>Nenhum dado disponível para exibir o calendário.</div>;
  }

  return (
    <>
      <AppointmentDetailsModal />
      <Dialog
        open={isModalOpen && isCreateModal()}
        onOpenChange={(open) => !open && closeModal()}
      >
        <AddAppointmentForm
          isOpen={isModalOpen && isCreateModal()}
          patients={patients}
          doctors={doctors}
          onSuccess={closeModal}
        />
      </Dialog>
      <div className="bg-card relative h-[80vh] max-w-full overflow-auto rounded-lg border p-4">
        <div className="bg-card rounded-lg">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            culture="pt-br"
            views={["month", "week", "day"]}
            defaultView="week"
            min={dayjs()
              .set("hour", APP_CONFIG.AGENDA.DEFAULT_START_HOUR)
              .set("minute", 0)
              .set("second", 0)
              .toDate()}
            max={dayjs()
              .set("hour", APP_CONFIG.AGENDA.DEFAULT_END_HOUR)
              .set("minute", 0)
              .set("second", 0)
              .toDate()}
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
            onEventDrop={handleEventDrop}
            resizable
            onEventResize={handleEventDrop}
            components={{
              event: CustomEvent as React.ComponentType<{
                event: { resource: { appointment: AppointmentWithRelations } };
              }>,
            }}
          />
        </div>
      </div>
    </>
  );
}
