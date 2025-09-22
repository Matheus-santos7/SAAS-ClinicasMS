import { createSafeActionClient } from "next-safe-action";

import { Session } from "@/helpers/session";

export type ProtectedContext = {
  session: Session;
  clinicId: string;
};

export const publicAction = createSafeActionClient();

export const protectedAction = createSafeActionClient();
