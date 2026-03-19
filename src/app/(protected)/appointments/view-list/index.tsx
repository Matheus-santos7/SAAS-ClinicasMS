"use client";

import {
  CalendarIcon,
  PhoneIcon,
  Stethoscope,
  UserIcon,
} from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { formatPhoneBr } from "@/helpers/phone";
import { cn } from "@/lib/utils";
import { AppointmentWithRelations } from "@/types";

import { AppointmentDetailsModal } from "../view-agenda/appointment-details-modal";
import { DateRangeFilter } from "./date-range-filter";
import AppointmentsTableActions from "./table-actions";
import { appointmentsTableColumns } from "./table-columns";

interface AppointmentListProps {
  appointments: AppointmentWithRelations[];
}

export function AppointmentListView({ appointments }: AppointmentListProps) {
  return (
    <>
      <div className="space-y-4 p-1 md:p-2 lg:p-4">
        <div className="flex justify-end">
          <DateRangeFilter className="w-full sm:w-auto" />
        </div>

        {/* Mobile: cards */}
        <div className="space-y-2 md:hidden">
          {appointments.map((appointment) => (
            <MobileAppointmentCard
              key={appointment.id}
              appointment={appointment}
            />
          ))}
          {!appointments.length && (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Nenhum agendamento encontrado para o período selecionado.
            </p>
          )}
        </div>

        {/* Desktop: tabela */}
        <div className="hidden md:block">
          <DataTable data={appointments} columns={appointmentsTableColumns} />
        </div>
      </div>
      <AppointmentDetailsModal />
    </>
  );
}

interface MobileCardProps {
  appointment: AppointmentWithRelations;
}

function MobileAppointmentCard({ appointment }: MobileCardProps) {
  const date = new Date(appointment.date);
  const endDate = new Date(appointment.endDate);

  const formattedDate = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const startTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = endDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasObservations = !!appointment.observations;
  const statusLabel =
    appointment.status === "confirmed"
      ? "Confirmado"
      : appointment.status === "pending"
        ? "Pendente"
        : appointment.status === "completed"
          ? "Concluído"
          : "Cancelado";
  const statusClass =
    appointment.status === "confirmed"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : appointment.status === "pending"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : appointment.status === "completed"
          ? "bg-emerald-700 text-emerald-50 border-emerald-800"
          : "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <div className="border-border bg-card/60 flex flex-col gap-2 rounded-xl border p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-foreground text-sm font-semibold">
            {appointment.patient.name}
          </p>
          <p className="text-muted-foreground text-xs">
            <CalendarIcon className="mr-1 inline-block h-3 w-3 align-middle" />
            <span className="align-middle">
              {formattedDate} · {startTime} - {endTime}
            </span>
          </p>
        </div>
        <AppointmentsTableActions appointment={appointment} />
      </div>

      <div className="flex flex-col gap-1 text-xs">
        <p className="text-muted-foreground flex items-center gap-1">
          <Stethoscope className="h-3 w-3" />
          <span>Dr(a). {appointment.doctor.name}</span>
        </p>
        {appointment.patient.email?.trim() && (
          <p className="text-muted-foreground flex items-center gap-1">
            <UserIcon className="h-3 w-3" />
            <span>{appointment.patient.email}</span>
          </p>
        )}
        {appointment.patient.phoneNumber?.trim() && (
          <p className="text-muted-foreground flex items-center gap-1">
            <PhoneIcon className="h-3 w-3" />
            <span>{formatPhoneBr(appointment.patient.phoneNumber)}</span>
          </p>
        )}
      </div>

      <div className="mt-1">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
            statusClass,
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusLabel}
        </span>
      </div>

      <div
        className={cn(
          "mt-1 rounded-md bg-muted/40 p-2 text-xs",
          !hasObservations && "text-muted-foreground italic",
        )}
      >
        {hasObservations
          ? appointment.observations
          : "Sem observações para este agendamento."}
      </div>
    </div>
  );
}
