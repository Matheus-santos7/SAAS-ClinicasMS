export const formatCurrencyInCents = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
};

/** Entrada tipo "1.234,56" ou "1234,56" → centavos. Inválido ou negativo → -1 */
export function parseReaisToCents(reaisStr: string): number {
  const n = parseFloat(reaisStr.replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(n) || n < 0) return -1;
  return Math.round(n * 100);
}

export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
