// src/app/(protected)/appointments/_components/doctor-filter.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { doctorsTable } from "@/db/schema";

type Doctor = typeof doctorsTable.$inferSelect;

interface DoctorFilterProps {
  doctors: Doctor[];
}

export function DoctorFilter({ doctors }: DoctorFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSelectDoctor = (doctorId: string) => {
    const params = new URLSearchParams(searchParams);
    if (doctorId && doctorId !== "all") {
      params.set("doctorId", doctorId);
    } else {
      params.delete("doctorId");
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-4 max-w-xs">
      <Select
        onValueChange={handleSelectDoctor}
        defaultValue={searchParams.get("doctorId")?.toString() || "all"}
      >
        <SelectTrigger>
          <SelectValue placeholder="Filtrar por dentista..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Dentistas</SelectItem>
          {doctors.map((doctor) => (
            <SelectItem key={doctor.id} value={doctor.id}>
              {doctor.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
