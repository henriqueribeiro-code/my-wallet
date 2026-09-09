import type {
  DaySpending,
  NewTransaction,
  Transaction,
  TransactionKind,
  WalletTotals,
} from '../types';
import { getDatabase } from './db';

interface TransactionRow {
  id: string;
  kind: TransactionKind;
  amount_cents: number;
  category: string;
  note: string | null;
  date: string;
  created_at: string;
}

function toDomain(row: TransactionRow): Transaction {
  return {
    id: row.id,
    kind: row.kind,
    amountCents: row.amount_cents,
    category: row.category,
    note: row.note,
    date: row.date,
    createdAt: row.created_at,
  };
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function insertTransaction(input: NewTransaction): Promise<Transaction> {
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('O valor precisa ser maior que zero.');
  }

  const db = await getDatabase();
  const transaction: Transaction = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO transactions (id, kind, amount_cents, category, note, date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.kind,
      transaction.amountCents,
      transaction.category,
      transaction.note,
      transaction.date,
      transaction.createdAt,
    ],
  );

  return transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function listTransactions(limit = 200): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM transactions
     ORDER BY date DESC, created_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map(toDomain);
}

/**
 * Saldo total da carteira + entradas/saídas do ciclo corrente.
 * Uma query só: agregação no SQLite é mais barata que trazer tudo para o JS.
 */
export async function getTotals(cycleStart: string): Promise<WalletTotals> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    balance: number | null;
    income_cycle: number | null;
    expense_cycle: number | null;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN kind = 'income' THEN amount_cents ELSE -amount_cents END), 0) AS balance,
       COALESCE(SUM(CASE WHEN kind = 'income'  AND date >= ? THEN amount_cents ELSE 0 END), 0) AS income_cycle,
       COALESCE(SUM(CASE WHEN kind = 'expense' AND date >= ? THEN amount_cents ELSE 0 END), 0) AS expense_cycle
     FROM transactions`,
    [cycleStart, cycleStart],
  );

  return {
    balanceCents: row?.balance ?? 0,
    incomeCycleCents: row?.income_cycle ?? 0,
    expenseCycleCents: row?.expense_cycle ?? 0,
  };
}

export async function getSpentOn(date: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT COALESCE(SUM(amount_cents), 0) AS total
     FROM transactions
     WHERE kind = 'expense' AND date = ?`,
    [date],
  );
  return row?.total ?? 0;
}

/** Gastos por dia num intervalo — alimenta a faixa dos últimos 7 dias. */
export async function getSpendingByDay(from: string, to: string): Promise<DaySpending[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string; total: number }>(
    `SELECT date, SUM(amount_cents) AS total
     FROM transactions
     WHERE kind = 'expense' AND date BETWEEN ? AND ?
     GROUP BY date`,
    [from, to],
  );
  return rows.map((row) => ({ date: row.date, spentCents: row.total }));
}

export async function getTopCategories(
  cycleStart: string,
  limit = 5,
): Promise<Array<{ category: string; totalCents: number }>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ category: string; total: number }>(
    `SELECT category, SUM(amount_cents) AS total
     FROM transactions
     WHERE kind = 'expense' AND date >= ?
     GROUP BY category
     ORDER BY total DESC
     LIMIT ?`,
    [cycleStart, limit],
  );
  return rows.map((row) => ({ category: row.category, totalCents: row.total }));
}
