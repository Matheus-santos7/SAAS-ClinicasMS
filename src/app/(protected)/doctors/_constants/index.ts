import { dentalSpecialties } from "@/constants/dental-specialties";

export const medicalSpecialties = dentalSpecialties.map((specialty) => ({
  value: specialty,
  label: specialty,
}));
