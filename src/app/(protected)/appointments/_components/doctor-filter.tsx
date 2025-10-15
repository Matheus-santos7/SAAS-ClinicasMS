"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doctor } from "@/types";

interface DoctorFilterProps {
  doctors: Doctor[];
}

export function DoctorFilter({ doctors }: DoctorFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  if (!doctors.length) {
    return <div>Nenhum dentista disponível.</div>;
  }

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
    <div className="max-w-xs">
      <Select
        onValueChange={handleSelectDoctor}
        defaultValue={searchParams.get("doctorId")?.toString() || "all"}
      >
        <SelectTrigger aria-label="Filtrar por dentista">
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
