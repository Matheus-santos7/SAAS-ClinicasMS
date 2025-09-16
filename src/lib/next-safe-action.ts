// src/lib/next-safe-action.ts
import { createSafeActionClient } from "next-safe-action";

import { type Session } from "@/helpers/session";

/**
 * Este é o tipo do nosso contexto (ctx) que estará disponível em
 * todas as actions protegidas. Ele contém a sessão completa e o ID da clínica.
 */
export type ProtectedContext = {
  session: Session;
  clinicId: string;
};

/**
 * Este é o nosso cliente de actions que já "sabe" como construir o contexto.
 * Ele será usado para criar todas as actions que precisam de autenticação.
 */
const protectedActionClient = createSafeActionClient({
  handleServerError(e: { message?: string }): string {
    return (
      e.message ?? "Ocorreu um erro inesperado, por favor, tente novamente."
    );
  },
});

/**
 * Exportamos o cliente de actions público para casos onde não é necessária autenticação.
 */
export const publicAction = createSafeActionClient();

/**
 * Exportamos o cliente de actions protegido.
 * Agora, para criar uma action segura, basta fazer:
 * `export const myAction = protectedAction.schema(...).action(...)`
 */
export const protectedAction = protectedActionClient;
