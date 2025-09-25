// Utilitários para cores dos médicos na agenda

import { DoctorColor } from "@/types";

// Cores predefinidas para médicos (mesmas do componente ColorSelect)
export const DOCTOR_COLORS: DoctorColor[] = [
  { value: "#3B82F6", name: "Azul", hex: "#3B82F6" }, // Blue
  { value: "#EF4444", name: "Vermelho", hex: "#EF4444" }, // Red
  { value: "#10B981", name: "Verde", hex: "#10B981" }, // Emerald
  { value: "#F59E0B", name: "Laranja", hex: "#F59E0B" }, // Amber
  { value: "#8B5CF6", name: "Roxo", hex: "#8B5CF6" }, // Violet
  { value: "#EC4899", name: "Rosa", hex: "#EC4899" }, // Pink
  { value: "#06B6D4", name: "Ciano", hex: "#06B6D4" }, // Cyan
  { value: "#84CC16", name: "Lima", hex: "#84CC16" }, // Lime
  { value: "#F97316", name: "Coral", hex: "#F97316" }, // Orange
  { value: "#6366F1", name: "Índigo", hex: "#6366F1" }, // Indigo
] as const;

/**
 * Retorna o nome da cor baseado no valor hex
 */
export const getColorName = (colorValue: string): string => {
  const color = DOCTOR_COLORS.find((c) => c.value === colorValue);
  return color?.name || "Cor personalizada";
};

/**
 * Gera um estilo CSS inline para o agendamento baseado na cor do médico
 */
export const getAppointmentStyle = (doctorColor: string) => ({
  backgroundColor: doctorColor,
  borderLeft: `4px solid ${doctorColor}`,
  color: "#ffffff",
  border: "none",
  borderRadius: "6px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
});

/**
 * Gera uma cor mais escura para hover/active states
 */
export const getDarkenedColor = (color: string): string => {
  // Remove o # se existir
  const hex = color.replace("#", "");

  // Converte hex para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Escurece em 20%
  const darkenedR = Math.max(0, Math.floor(r * 0.8));
  const darkenedG = Math.max(0, Math.floor(g * 0.8));
  const darkenedB = Math.max(0, Math.floor(b * 0.8));

  // Converte de volta para hex
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(darkenedR)}${toHex(darkenedG)}${toHex(darkenedB)}`;
};

/**
 * Verifica se uma cor é válida
 */
export const isValidDoctorColor = (color: string): boolean => {
  return DOCTOR_COLORS.some((c) => c.value === color);
};

/**
 * Retorna a cor padrão se a cor fornecida não for válida
 */
export const getValidDoctorColor = (color?: string): string => {
  if (!color || !isValidDoctorColor(color)) {
    return DOCTOR_COLORS[0].value; // Azul como padrão
  }
  return color;
};
