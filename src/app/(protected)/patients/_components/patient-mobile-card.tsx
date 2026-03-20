"use client";

import { IdCard, Mail, Phone, UserRound } from "lucide-react";
import Link from "next/link";

import { formatPhoneBr } from "@/helpers/phone";
import type { Patient } from "@/types";

import PatientsTableActions from "./table-actions";

function formatCpfDisplay(cpf: string | null | undefined): string {
  if (!cpf) return "-";
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

interface PatientMobileCardProps {
  patient: Patient;
}

export function PatientMobileCard({ patient }: PatientMobileCardProps) {
  const sexLabel = patient.sex === "male" ? "Masculino" : "Feminino";
  const phone = formatPhoneBr(patient.phoneNumber);
  const email = patient.email?.trim();

  return (
    <div className="border-border bg-card/60 flex flex-col gap-2 rounded-xl border p-3 shadow-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/patients/${patient.id}`}
            className="text-foreground line-clamp-2 text-sm font-semibold hover:underline"
          >
            {patient.name}
          </Link>
        </div>
        <PatientsTableActions patient={patient} />
      </div>

      <div className="flex flex-col gap-1.5 text-xs">
        {email ? (
          <p className="text-muted-foreground flex min-w-0 items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{email}</span>
          </p>
        ) : null}
        {phone ? (
          <p className="text-muted-foreground flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{phone}</span>
          </p>
        ) : null}
        <p className="text-muted-foreground flex items-center gap-1.5">
          <IdCard className="h-3.5 w-3.5 shrink-0" />
          <span>{formatCpfDisplay(patient.cpf)}</span>
        </p>
        <p className="text-muted-foreground flex items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5 shrink-0" />
          <span>{sexLabel}</span>
        </p>
      </div>
    </div>
  );
}
