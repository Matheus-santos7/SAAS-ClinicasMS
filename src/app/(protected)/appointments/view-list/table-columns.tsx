"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { formatPhoneBr } from "@/helpers/phone";
import { cn } from "@/lib/utils";
import { AppointmentWithRelations } from "@/types";

import AppointmentsTableActions from "./table-actions";

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "Confirmado";
    case "pending":
      return "Pendente";
    case "completed":
      return "Concluído";
    case "canceled":
      return "Cancelado";
    default:
      return status;
  }
};

const getStatusClass = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "completed":
      return "bg-emerald-700 text-emerald-50 border border-emerald-800";
    case "canceled":
      return "bg-rose-100 text-rose-700 border border-rose-200";
    default:
      return "";
  }
};

export const appointmentsTableColumns: ColumnDef<AppointmentWithRelations>[] = [
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: (params) => {
      const status = params.row.original.status;
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-[11px] font-medium",
            getStatusClass(status),
          )}
        >
          {getStatusLabel(status)}
        </Badge>
      );
    },
  },
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    id: "phone",
    accessorKey: "patient.phoneNumber",
    header: "Telefone",
    cell: (params) => {
      const phone = params.row.original.patient?.phoneNumber;
      if (!phone?.trim()) return "-";
      return formatPhoneBr(phone);
    },
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Dentista",
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data e Hora",
    cell: (params) => {
      const appointment = params.row.original;
      return format(new Date(appointment.date), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    },
  },
  {
    id: "observations",
    accessorKey: "observations",
    header: "Observação",
    cell: (params) => {
      const appointment = params.row.original;
      const text = appointment.observations ?? "";
      if (!text) return "-";
      const display = text.length > 120 ? `${text.slice(0, 117)}...` : text;
      return <span className="block max-w-3xl">{display}</span>;
    },
  },
  {
    id: "actions",
    header: () => (
      <div className="w-[80px] text-right">Ações</div>
    ),
    cell: (params) => {
      const appointment = params.row.original;
      return (
        <div className="flex w-[80px] justify-end">
          <AppointmentsTableActions appointment={appointment} />
        </div>
      );
    },
  },
];