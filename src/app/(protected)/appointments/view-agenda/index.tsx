"use client";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "dayjs/locale/pt-br";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import dayjs from "dayjs";
import { Calendar as CalendarIcon, Loader2, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import React, { useCallback, useMemo, useState } from "react";
import {
  Calendar,
  dayjsLocalizer,
  Event as RBCEvent,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import { toast } from "sonner";

import { updateAppointmentDate } from "@/actions/appointment/update-appointment-date";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import {
  getAppointmentStyle,
  getValidDoctorColor,
} from "@/helpers/doctor-colors";
import { cn } from "@/lib/utils";
import { useAppointmentStore } from "@/stores";
import { AppointmentWithRelations, Doctor, Patient } from "@/types";

import AddAppointmentForm from "../_components/add-appointment-form";
import { AppointmentDetailsModal } from "./appointment-details-modal";

dayjs.locale("pt-br");
const localizer = dayjsLocalizer(dayjs);

const DnDCalendar = withDragAndDrop(Calendar);

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

const CustomMonthEvent = (props: CustomEventProps) => {
  const { event } = props;
  const { appointment } = event.resource;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-md p-1 text-white shadow-sm md:p-2">
      <div className="mb-1 flex items-center gap-1 md:gap-2">
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/40 md:h-2 md:w-2"></div>
        <p
          className="truncate text-[10px] font-semibold md:text-xs"
          title={appointment.patient.name}
        >
          {appointment.patient.name}
        </p>
      </div>
      <p
        className="hidden truncate text-[10px] opacity-90 md:block md:text-xs"
        title={`Dr(a). ${appointment.doctor.name}`}
      >
        {appointment.doctor.name}
      </p>
      <span
        className={cn(
          "mt-1 inline-block rounded px-1 py-0.5 text-[8px] font-medium md:text-[10px]",
          appointment.status === "confirmed"
            ? "bg-green-600/50"
            : appointment.status === "pending"
              ? "bg-yellow-600/50"
              : "bg-gray-600/50",
        )}
      >
        {appointment.status === "confirmed"
          ? "OK"
          : appointment.status === "pending"
            ? "PEND"
            : "CANC"}
      </span>
    </div>
  );
};

const CustomWeekDayEvent = (props: CustomEventProps) => {
  const { event } = props;
  const { appointment } = event.resource;

  return (
    <div className="flex h-full flex-col overflow-hidden p-1 text-white md:p-2">
      <div className="mb-1 flex items-center gap-1 md:gap-2">
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/40 md:h-2 md:w-2"></div>
        <p
          className="truncate text-[10px] font-semibold md:text-xs"
          title={appointment.patient.name}
        >
          {appointment.patient.name}
        </p>
      </div>
      <p
        className="truncate text-[10px] opacity-90 md:text-xs"
        title={`Dr(a). ${appointment.doctor.name}`}
      >
        {appointment.doctor.name}
      </p>
      <span
        className={cn(
          "mt-1 inline-block self-start rounded px-1 py-0.5 text-[8px] font-medium md:text-[10px]",
          appointment.status === "confirmed"
            ? "bg-green-600/50"
            : appointment.status === "pending"
              ? "bg-yellow-600/50"
              : "bg-gray-600/50",
        )}
      >
        {appointment.status === "confirmed"
          ? "OK"
          : appointment.status === "pending"
            ? "PEND"
            : "CANC"}
      </span>
    </div>
  );
};

const CalendarHeader = ({
  onViewChange,
  currentView,
  doctorName,
}: {
  onViewChange: (view: "day" | "week" | "month") => void;
  currentView: "day" | "week" | "month";
  doctorName?: string;
}) => (
  <Card className="from-primary/5 to-secondary/5 mb-6 border-0 bg-linear-to-r">
    <CardHeader className="pb-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-primary h-6 w-6" />
          <CardTitle className="text-foreground text-2xl font-bold">
            {doctorName ? `Agenda - Dr(a). ${doctorName}` : "Minha Agenda"}
          </CardTitle>
        </div>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((view) => (
            <Button
              key={view}
              variant={currentView === view ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange(view)}
              className="px-3 py-1 text-xs capitalize"
            >
              {view === "day" ? "Dia" : view === "week" ? "Semana" : "Mês"}
            </Button>
          ))}
        </div>
      </div>
    </CardHeader>
  </Card>
);

export default function AgendaView({
  appointments,
  patients,
  doctors,
}: AgendaViewProps) {
  const [currentView, setCurrentView] = useState<
    "day" | "week" | "month" | "agenda"
  >("week");
  const searchParams = useSearchParams();
  const {
    openViewModal,
    openCreateModal,
    isModalOpen,
    closeModal,
    isCreateModal,
  } = useAppointmentStore();
  const doctorId = searchParams.get("doctorId");
  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  const { execute: executeUpdate, isPending: isUpdating } = useAction(
    updateAppointmentDate,
    {
      onSuccess: (data) =>
        toast.success(
          data?.data?.success || "Agendamento atualizado com sucesso!",
        ),
      onError: (error) =>
        toast.error(error.error?.serverError || "Falha ao reagendar."),
    },
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: RBCEvent; start: Date; end: Date }) => {
      const resource = event.resource as {
        appointment?: AppointmentWithRelations;
      };
      if (!resource?.appointment) {
        toast.error("Erro: Agendamento inválido.");
        return;
      }
      toast.info("Atualizando agendamento...");
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
    const isPast = event.end < new Date();
    const baseStyle: React.CSSProperties = {
      opacity: isPast ? 0.7 : 0.95,
      display: "block",
      borderRadius: "8px",
      border: "none",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      transition: "filter 120ms ease, opacity 120ms ease",
      cursor: "pointer",
    };

    if (!resource?.appointment?.doctor) {
      return {
        className: "appointment-event",
        style: baseStyle,
      };
    }

    const doctorColor = getValidDoctorColor(resource.appointment.doctor.color);

    return {
      className: "appointment-event",
      style: {
        ...baseStyle,
        ...getAppointmentStyle(doctorColor),
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
    [openCreateModal],
  );

  const messages = useMemo(
    () => ({
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
      noEventsInRange:
        "Nenhum agendamento neste período. Clique em um horário para criar.",
      showMore: (total: number) => `+ Ver ${total} mais`,
    }),
    [],
  );

  if (!appointments?.length && (!patients.length || !doctors.length)) {
    return (
      <Card className="mt-6">
        <CardContent className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <CalendarIcon className="text-muted-foreground h-16 w-16" />
          <h3 className="text-xl font-semibold">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-muted-foreground">
            {!patients.length || !doctors.length
              ? "Cadastre pacientes e médicos para começar a agendar."
              : "Clique em um horário vago na agenda ou no botão '+' para criar o primeiro agendamento."}
          </p>
          {patients.length > 0 && doctors.length > 0 && (
            <Button
              onClick={() => {
                const now = new Date();
                const end = new Date(now.getTime() + 60 * 60 * 1000);
                handleSelectSlot({ start: now, end });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-2 lg:p-4">
      <CalendarHeader
        onViewChange={(view) => setCurrentView(view)}
        currentView={currentView === "agenda" ? "week" : currentView}
        doctorName={selectedDoctor?.name}
      />

      <Button
        onClick={() => {
          const now = new Date();
          const end = new Date(now.getTime() + 60 * 60 * 1000);
          handleSelectSlot({ start: now, end });
        }}
        className="fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg lg:hidden"
        size="icon"
        aria-label="Novo agendamento"
      >
        <Plus className="h-6 w-6" />
      </Button>
      <div className="hidden justify-end lg:flex">
        <Button
          onClick={() => {
            const now = new Date();
            const end = new Date(now.getTime() + 60 * 60 * 1000);
            handleSelectSlot({ start: now, end });
          }}
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {isUpdating && (
            <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          )}
          <div
            className="relative h-[70vh] overflow-y-auto"
            style={{ minHeight: "600px" }}
          >
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day"]}
              view={currentView as "month" | "week" | "day"}
              onView={(view: "day" | "week" | "month" | "agenda") =>
                setCurrentView(view)
              }
              messages={messages}
              eventPropGetter={eventPropGetter}
              onSelectEvent={handleSelectEvent}
              selectable
              onSelectSlot={handleSelectSlot}
              onEventDrop={handleEventDrop}
              resizable
              onEventResize={handleEventDrop}
              components={{
                event: CustomWeekDayEvent,
                month: {
                  event: CustomMonthEvent,
                },
                toolbar: () => null,
              }}
              className="custom-calendar"
              culture="pt-br"
              popup
              step={15}
              timeslots={4}
              min={dayjs().hour(7).minute(0).toDate()}
              max={dayjs().hour(21).minute(0).toDate()}
              defaultDate={new Date()}
            />
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
