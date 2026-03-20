export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  APPOINTMENTS: "/appointments",
  DOCTORS: "/doctors",
  PATIENTS: "/patients",
  /** Registry: clinic procedures, expense types, vendors (UI labels in pt-BR) */
  REGISTRY: "/registry",
  SUBSCRIPTION: "/subscription",
  CLINIC_FORM: "/clinic-form",
  LOGIN: "/authentication",
  patientById: (id: string) => `/patients/${id}`,
} as const;

export type RouteKey = keyof typeof ROUTES;
