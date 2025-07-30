import { z } from "zod";

// Tipo para definir o resultado de uma action
type ActionResult<T> = {
  data?: T;
  error?: {
    message: string;
    fieldErrors?: Record<string, string[]>;
    serverError?: string;
  };
};

// Tipo para a função handler da action
type ActionHandler<TInput, TOutput> = (input: {
  parsedInput: TInput;
}) => Promise<TOutput> | TOutput;

/**
 * Cria uma Server Action segura com validação automática
 * @param schema - Schema Zod para validação dos dados de entrada
 * @param handler - Função que processa a action
 * @returns Server Action tipada e validada
 */
export function createSafeAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: ActionHandler<TInput, TOutput>
) {
  return async (data: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Valida os dados de entrada usando o schema Zod
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        // Retorna erros de validação formatados
        const fieldErrors: Record<string, string[]> = {};
        
        validationResult.error.errors.forEach((error) => {
          const field = error.path.join(".");
          if (!fieldErrors[field]) {
            fieldErrors[field] = [];
          }
          fieldErrors[field].push(error.message);
        });

        return {
          error: {
            message: "Dados de entrada inválidos",
            fieldErrors,
          },
        };
      }

      // 2. Executa o handler com os dados validados
      const result = await handler({
        parsedInput: validationResult.data,
      });

      // 3. Retorna o resultado de sucesso
      return {
        data: result,
      };
    } catch (error) {
      // 4. Captura e formata erros do servidor
      console.error("Erro na Server Action:", error);
      
      return {
        error: {
          message: "Erro interno do servidor",
          serverError: error instanceof Error ? error.message : "Erro desconhecido",
        },
      };
    }
  };
}

// Exportação alternativa para compatibilidade
export const safeAction = createSafeAction;

// Tipo utilitário para extrair o tipo de input de uma action
export type SafeActionInput<T> = T extends (
  input: infer U
) => unknown
  ? U
  : never;

// Tipo utilitário para extrair o tipo de output de uma action
export type SafeActionOutput<T> = T extends (
  input: unknown
) => Promise<ActionResult<infer U>>
  ? U
  : never;