export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  APPOINTMENTS: "/appointments",
  DOCTORS: "/doctors",
  PATIENTS: "/patients",
  FINANCIAL: "/financial",
  SUBSCRIPTION: "/subscription",
  CLINIC_FORM: "/clinic-form",
  LOGIN: "/authentication",
  patientById: (id: string) => `/patients/${id}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
