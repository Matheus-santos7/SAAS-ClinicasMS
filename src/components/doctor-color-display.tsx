// Exemplo de como implementar o seletor de cores em um componente separado
// Este arquivo é apenas para referência e demonstração

import React from "react";

import { Badge } from "@/components/ui/badge";
import { getColorName } from "@/helpers/doctor-colors";

interface DoctorColorDisplayProps {
  doctorColor: string;
  doctorName: string;
}

/**
 * Componente para exibir a cor do médico de forma visual
 * Pode ser usado em listas, cards ou detalhes do médico
 */
export const DoctorColorDisplay: React.FC<DoctorColorDisplayProps> = ({
  doctorColor,
  doctorName,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-4 w-4 rounded-full border-2 border-white shadow-sm"
        style={{ backgroundColor: doctorColor }}
        title={`Cor da agenda: ${getColorName(doctorColor)}`}
      />
      <span className="text-sm font-medium">{doctorName}</span>
      <Badge variant="secondary" className="text-xs">
        {getColorName(doctorColor)}
      </Badge>
    </div>
  );
};

/**
 * Componente para exibir legenda de cores dos médicos
 * Útil para mostrar todos os médicos e suas cores
 */
interface DoctorColorLegendProps {
  doctors: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export const DoctorColorLegend: React.FC<DoctorColorLegendProps> = ({
  doctors,
}) => {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">
        Legenda dos Médicos
      </h3>
      <div className="space-y-2">
        {doctors.map((doctor) => (
          <DoctorColorDisplay
            key={doctor.id}
            doctorColor={doctor.color}
            doctorName={doctor.name}
          />
        ))}
      </div>
    </div>
  );
};

// Exemplo de uso:
// <DoctorColorDisplay doctorColor="#3B82F6" doctorName="Dr. João Silva" />
// <DoctorColorLegend doctors={doctorsData} />
