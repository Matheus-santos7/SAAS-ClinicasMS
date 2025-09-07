export function canAccessClinicResource(
  resourceClinicId: string | null | undefined,
  userClinicId: string | null | undefined,
) {
  return resourceClinicId === userClinicId;
}
