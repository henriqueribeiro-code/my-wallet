export type TransactionKind = 'income' | 'expense';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  /** Sempre positivo e em centavos. O sinal é dado por `kind`. */
  amountCents: number;
  category: string;
  note: string | null;
  /** Data do fato gerador no formato YYYY-MM-DD (horário local). */
  date: string;
  createdAt: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

export interface Settings {
  /** Valor que nunca entra no cálculo do gasto diário (reserva/emergência). */
  reserveCents: number;
  /** Dia do mês em que o ciclo reinicia (ex.: dia do salário). */
  cycleStartDay: number;
}

export interface WalletTotals {
  balanceCents: number;
  incomeCycleCents: number;
  expenseCycleCents: number;
}

export interface DailyBudget {
  /** Quanto pode ser gasto hoje, já descontada a reserva. */
  allowanceCents: number;
  /** O que já saiu hoje. */
  spentTodayCents: number;
  /** allowance - spentToday (pode ser negativo). */
  remainingCents: number;
  /** Dias restantes no ciclo, incluindo hoje. */
  daysLeft: number;
  /** Data em que o ciclo reinicia (YYYY-MM-DD). */
  cycleEndsOn: string;
  /** 0..1 — proporção consumida da meta do dia. */
  progress: number;
}

export interface DaySpending {
  date: string;
  spentCents: number;
}
