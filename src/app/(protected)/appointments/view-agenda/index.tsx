"use client";

// Estilos do calendário e localização pt-BR
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getAppointmentStyle,
  getValidDoctorColor,
} from "@/helpers/doctor-colors";
import { cn } from "@/lib/utils";
import { useAppointmentStore } from "@/stores";
import { AppointmentWithRelations, Doctor, Patient } from "@/types";

import AddAppointmentForm from "../_components/add-appointment-form";
import { ScheduleToolbar } from "../_components/schedule-toolbar";
import { AppointmentDetailsModal } from "./appointment-details-modal";

// Configuração de locale e calendário com arrastar-e-soltar
dayjs.locale("pt-br");
const localizer = dayjsLocalizer(dayjs);
const DnDCalendar = withDragAndDrop(Calendar);

/** Props da view de agenda: lista de agendamentos, pacientes e Dentistas */
interface AgendaViewProps {
  appointments: AppointmentWithRelations[];
  patients: Patient[];
  doctors: Doctor[];
}

/** Props dos componentes de evento customizado (event.resource.appointment) */
type CustomEventProps = {
  event: {
    resource: {
      appointment: AppointmentWithRelations;
    };
  };
};

/** Formata início e fim como "HH:mm - HH:mm" */
const formatEventTime = (start: Date, end: Date) =>
  `${dayjs(start).format("HH:mm")} - ${dayjs(end).format("HH:mm")}`;

/** Evento no modo mês: uma linha compacta, sem fundo, texto na cor primária */
const CustomMonthEvent = (props: CustomEventProps) => {
  const { event } = props;
  const { appointment } = event.resource;
  const doctorColor = getValidDoctorColor(appointment.doctor?.color);
  const timeStart = dayjs(appointment.date).format("HH:mm");

  return (
    <div
      className="flex h-full items-center gap-1.5 overflow-hidden rounded py-0.5 pr-1"
      title={`${appointment.patient.name} · ${timeStart}`}
    >
      <div
        className="h-1.5 w-1.5 shrink-0 rounded-full md:h-2 md:w-2"
        style={{ backgroundColor: doctorColor }}
      />
      <span className="shrink-0 text-[9px] text-primary md:text-[10px]">
        {timeStart}
      </span>
      <span className="min-w-0 truncate text-[10px] font-medium text-primary md:text-xs">
        {appointment.patient.name}
      </span>
    </div>
  );
};

/** Evento customizado exibido nas visualizações dia/semana */
const CustomWeekDayEvent = (props: CustomEventProps) => {
  const { event } = props;
  const { appointment } = event.resource;
  const timeLabel = formatEventTime(
    dayjs(appointment.date).toDate(),
    dayjs(appointment.endDate).toDate(),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden p-1 text-white md:p-2">
      <div className="mb-1 flex flex-wrap items-center gap-1 md:gap-2">
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/40 md:h-2 md:w-2"></div>
        <p
          className="truncate text-[10px] font-semibold md:text-xs"
          title={`${appointment.patient.name} · ${timeLabel}`}
        >
          {appointment.patient.name}
        </p>
        <span className="shrink-0 text-[9px] opacity-90 md:text-[10px]">
          {timeLabel}
        </span>
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
            ? "bg-emerald-500/80"
            : appointment.status === "pending"
              ? "bg-amber-400/80"
              : appointment.status === "completed"
                ? "bg-emerald-800/80"
                : "bg-rose-500/80",
        )}
      >
        {appointment.status === "confirmed"
          ? "Confirmado"
          : appointment.status === "pending"
            ? "Pendente"
            : appointment.status === "completed"
              ? "Concluído"
              : "Cancelado"}
      </span>
    </div>
  );
};

/**
 * View principal da agenda: calendário com arrastar/soltar, filtro por Dentista,
 * modais de detalhes e criação de agendamento.
 */
export default function AgendaView({
  appointments,
  patients,
  doctors,
}: AgendaViewProps) {
  // Estado da visualização (dia/semana/mês) e data atual
  const [currentView, setCurrentView] = useState<"day" | "week" | "month">(
    "week",
  );
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dayDialogDate, setDayDialogDate] = useState<Date | null>(null);
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

  // Server Action para atualizar data/hora do agendamento (drag/resize)
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

  /** Ao arrastar ou redimensionar evento, atualiza data e endDate do agendamento */
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

  /** Converte agendamentos para o formato de eventos do react-big-calendar */
  const events = useMemo(
    () =>
      appointments.map((appointment) => {
        const timeStr = `${dayjs(appointment.date).format("HH:mm")} - ${dayjs(appointment.endDate).format("HH:mm")}`;
        return {
          title: `${appointment.patient.name} ${timeStr}`,
          start: dayjs(appointment.date).toDate(),
          end: dayjs(appointment.endDate).toDate(),
          resource: { appointment },
        };
      }),
    [appointments],
  );

  /** Estilo do evento: no modo mês sem fundo (só texto primário); dia/semana com cor do Dentista */
  const eventPropGetter = useCallback(
    (event: RBCEvent) => {
      const resource = event.resource as {
        appointment?: AppointmentWithRelations;
      };
      const isPast = event.end < new Date();
      const baseStyle: React.CSSProperties = {
        opacity: isPast ? 0.7 : 0.95,
        display: "block",
        borderRadius: "6px",
        border: "none",
        transition: "filter 120ms ease, opacity 120ms ease",
        cursor: "pointer",
      };

      if (currentView === "month") {
        return {
          className: "appointment-event text-primary",
          style: {
            ...baseStyle,
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        };
      }

      const dayWeekStyle: React.CSSProperties = {
        ...baseStyle,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      };

      if (!resource?.appointment?.doctor) {
        return { className: "appointment-event", style: dayWeekStyle };
      }

      const doctorColor = getValidDoctorColor(resource.appointment.doctor.color);

      return {
        className: "appointment-event",
        style: {
          ...dayWeekStyle,
          ...getAppointmentStyle(doctorColor),
        },
      };
    },
    [currentView],
  );

  /** Ao clicar em um evento, abre o modal de detalhes do agendamento */
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

  /** No modo mês: abre o card do dia. Nos modos dia/semana: abre modal de novo agendamento */
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (currentView === "month") {
        setDayDialogDate(start);
      } else {
        openCreateModal({ start, end });
      }
    },
    [currentView, openCreateModal],
  );

  /** Textos em pt-BR para navegação e labels do calendário */
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
      showMore: (total: number) => `Mais ${total}`,
    }),
    [],
  );

  /** Agendamentos do dia selecionado (card no modo mês), ordenados por horário */
  const dayDialogAppointments = useMemo(() => {
    if (!dayDialogDate) return [];
    return appointments
      .filter((a) => dayjs(a.date).isSame(dayDialogDate, "day"))
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
  }, [appointments, dayDialogDate]);

  /** Abre modal de novo agendamento no dia do card e fecha o card */
  const handleNewAppointmentFromDayCard = useCallback(() => {
    if (!dayDialogDate) return;
    const start = dayjs(dayDialogDate).hour(8).minute(0).second(0).toDate();
    const end = dayjs(start).add(1, "hour").toDate();
    setDayDialogDate(null);
    openCreateModal({ start, end });
  }, [dayDialogDate, openCreateModal]);

  // Estado vazio: sem agendamentos ou sem pacientes/Dentistas cadastrados
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
              ? "Cadastre pacientes e Dentistas para começar a agendar."
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
      <div className="flex justify-end">
        <ScheduleToolbar
          currentView={currentView}
          currentDate={currentDate}
          onViewChange={setCurrentView}
          onDateChange={setCurrentDate}
          className="justify-end"
        />
      </div>
      <Card className="overflow-hidden shadow-sm">
        <CardContent className="p-0">
          {isUpdating && (
            <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          )}
          <div
            className="relative h-[70vh] overflow-y-auto bg-background"
            style={{ minHeight: "600px" }}
          >
            <DnDCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              views={["month", "week", "day"]}
              view={currentView}
              onView={(view) =>
                setCurrentView((view as "day" | "week" | "month") ?? "week")
              }
              date={currentDate}
              onNavigate={(date: Date) => setCurrentDate(date)}
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
              min={dayjs().hour(6).minute(30).toDate()}
              max={dayjs().hour(23).minute(30).toDate()}
              defaultDate={new Date()}
            />
          </div>
        </CardContent>
      </Card>

      <AppointmentDetailsModal />

      {/* Card do dia (modo mês): lista de agendamentos ao clicar em um dia */}
      <Dialog
        open={!!dayDialogDate}
        onOpenChange={(open) => !open && setDayDialogDate(null)}
      >
        <DialogContent className="max-h-[85vh] sm:max-w-md">
          {dayDialogDate && (
            <>
              <DialogHeader className="space-y-0">
                <div className="flex items-baseline gap-2">
                  <DialogTitle className="text-base font-semibold text-muted-foreground">
                    {dayjs(dayDialogDate).format("ddd").toUpperCase()}.
                  </DialogTitle>
                  <span className="text-3xl font-bold">
                    {dayjs(dayDialogDate).format("D")}
                  </span>
                </div>
              </DialogHeader>
              <div className="max-h-[50vh] space-y-0 overflow-y-auto py-2">
                {dayDialogAppointments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum agendamento neste dia.
                  </p>
                ) : (
                  <ul className="space-y-0">
                    {dayDialogAppointments.map((appointment) => {
                      const doctorColor = getValidDoctorColor(
                        appointment.doctor?.color,
                      );
                      const timeStart = dayjs(appointment.date).format("HH:mm");
                      return (
                        <li key={appointment.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setDayDialogDate(null);
                              openViewModal(appointment);
                            }}
                            className={cn(
                              "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-muted/60",
                            )}
                          >
                            <div
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: doctorColor }}
                            />
                            <span className="shrink-0 text-muted-foreground">
                              {timeStart}
                            </span>
                            <span className="min-w-0 truncate font-medium">
                              {appointment.patient.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleNewAppointmentFromDayCard}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo agendamento
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
