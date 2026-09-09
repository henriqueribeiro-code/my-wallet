/**
 * Todo valor monetário trafega como inteiro em centavos.
 * Float só aparece na formatação final, nunca em soma/subtração.
 */

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const brlCompact = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCents(cents: number): string {
  return brl.format(cents / 100);
}

/** Sem o símbolo — para quando o "R$" já está na interface. */
export function formatCentsPlain(cents: number): string {
  return brlCompact.format(cents / 100);
}

export function formatSigned(cents: number, kind: 'income' | 'expense'): string {
  const sign = kind === 'income' ? '+' : '−';
  return `${sign} ${formatCents(Math.abs(cents))}`;
}

/** Converte o que o usuário digitou no teclado numérico em centavos. */
export function digitsToCents(input: string): number {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  return digits.length === 0 ? 0 : Number(digits);
}

/** Divisão inteira arredondando para baixo — nunca "cria" centavo do nada. */
export function divideCents(totalCents: number, parts: number): number {
  if (parts <= 0) return 0;
  return Math.floor(totalCents / parts);
}
