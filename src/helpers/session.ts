import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export async function getSessionOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

type Session = {
  user: {
    clinic?: {
      id?: string;
    };
    // add other user properties if needed
  };
  // add other session properties if needed
};

export function getClinicIdOrThrow(session: Session) {
  const clinicId = session.user.clinic?.id;
  if (!clinicId) {
    throw new Error("Clínica não encontrada");
  }
  return clinicId;
}
