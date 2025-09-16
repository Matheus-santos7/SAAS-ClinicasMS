// src/helpers/session.ts
import { headers } from "next/headers";

import { auth } from "@/lib/auth";

// Tipagem para a Sessão, para nos ajudar com o autocomplete e segurança de tipos.
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Obtém a sessão do usuário. Se não houver sessão, lança um erro.
 * Garante que nenhuma lógica prossiga sem um usuário autenticado.
 * @returns A sessão do usuário.
 * @throws Error se o usuário não estiver autenticado.
 */
export async function getSessionOrThrow() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Usuário não autenticado. Acesso negado.");
  }
  return session;
}

/**
 * Extrai o ID da clínica da sessão. Se não houver, lança um erro.
 * @param session - O objeto de sessão validado.
 * @returns O ID da clínica.
 * @throws Error se a clínica não for encontrada na sessão.
 */
export function getClinicIdOrThrow(session: Session) {
  const clinicId = session?.user?.clinic?.id;
  if (!clinicId) {
    throw new Error("Clínica não encontrada para este usuário.");
  }
  return clinicId;
}

