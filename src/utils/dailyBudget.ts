import type { DailyBudget, Settings } from '../types';
import { daysInMonth, diffInDays, fromISODate, toISODate, today as todayISO } from './date';
import { divideCents } from './money';

/**
 * Data em que o próximo ciclo começa (exclusiva).
 * Se o dia configurado não existe no mês (31 em fevereiro), cai no último dia.
 */
export function nextCycleStart(reference: string, cycleStartDay: number): string {
  const date = fromISODate(reference);
  const year = date.getFullYear();
  const month = date.getMonth();

  const clampedDay = (y: number, m: number) =>
    Math.min(Math.max(cycleStartDay, 1), daysInMonth(y, m));

  const startThisMonth = clampedDay(year, month);
  if (date.getDate() < startThisMonth) {
    return toISODate(new Date(year, month, startThisMonth));
  }

  const nextYear = month === 11 ? year + 1 : year;
  const nextMonth = (month + 1) % 12;
  return toISODate(new Date(nextYear, nextMonth, clampedDay(nextYear, nextMonth)));
}

/** Primeiro dia do ciclo corrente (inclusivo). */
export function currentCycleStart(reference: string, cycleStartDay: number): string {
  const date = fromISODate(reference);
  const year = date.getFullYear();
  const month = date.getMonth();

  const clampedDay = (y: number, m: number) =>
    Math.min(Math.max(cycleStartDay, 1), daysInMonth(y, m));

  const startThisMonth = clampedDay(year, month);
  if (date.getDate() >= startThisMonth) {
    return toISODate(new Date(year, month, startThisMonth));
  }

  const prevYear = month === 0 ? year - 1 : year;
  const prevMonth = month === 0 ? 11 : month - 1;
  return toISODate(new Date(prevYear, prevMonth, clampedDay(prevYear, prevMonth)));
}

export function daysLeftInCycle(reference: string, cycleStartDay: number): number {
  return Math.max(1, diffInDays(reference, nextCycleStart(reference, cycleStartDay)));
}

interface BudgetInput {
  balanceCents: number;
  spentTodayCents: number;
  settings: Settings;
  reference?: string;
}

/**
 * Quanto dá para gastar hoje.
 *
 * A meta é recalculada todo dia sobre o saldo real, então um estouro ontem
 * reduz automaticamente o limite de hoje — sem precisar de "dívida" separada.
 *
 * O gasto de hoje é somado de volta ao saldo antes da divisão. Sem isso, a meta
 * encolheria a cada compra do próprio dia e o usuário nunca a alcançaria.
 */
export function computeDailyBudget({
  balanceCents,
  spentTodayCents,
  settings,
  reference = todayISO(),
}: BudgetInput): DailyBudget {
  const daysLeft = daysLeftInCycle(reference, settings.cycleStartDay);
  const startOfDayBalance = balanceCents + spentTodayCents;
  const spendable = Math.max(0, startOfDayBalance - settings.reserveCents);

  const allowanceCents = divideCents(spendable, daysLeft);
  const remainingCents = allowanceCents - spentTodayCents;

  const progress =
    allowanceCents > 0
      ? Math.min(1, Math.max(0, spentTodayCents / allowanceCents))
      : spentTodayCents > 0
        ? 1
        : 0;

  return {
    allowanceCents,
    spentTodayCents,
    remainingCents,
    daysLeft,
    cycleEndsOn: nextCycleStart(reference, settings.cycleStartDay),
    progress,
  };
}
