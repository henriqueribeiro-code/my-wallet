import {
  computeDailyBudget,
  currentCycleStart,
  daysLeftInCycle,
  nextCycleStart,
} from '../dailyBudget';

const settings = { reserveCents: 0, cycleStartDay: 5 };

describe('ciclo', () => {
  it('aponta para o próximo dia de virada no mês seguinte', () => {
    expect(nextCycleStart('2026-09-09', 5)).toBe('2026-10-05');
  });

  it('aponta para o mês corrente quando a virada ainda não chegou', () => {
    expect(nextCycleStart('2026-09-03', 5)).toBe('2026-09-05');
  });

  it('vira o ano corretamente', () => {
    expect(nextCycleStart('2026-12-20', 5)).toBe('2027-01-05');
  });

  it('encaixa o dia 31 em meses curtos', () => {
    expect(nextCycleStart('2026-01-31', 31)).toBe('2026-02-28');
  });

  it('devolve o início do ciclo corrente', () => {
    expect(currentCycleStart('2026-09-09', 5)).toBe('2026-09-05');
    expect(currentCycleStart('2026-09-03', 5)).toBe('2026-08-05');
  });

  it('conta o dia de hoje e ignora o dia da virada', () => {
    expect(daysLeftInCycle('2026-09-03', 5)).toBe(2);
    expect(daysLeftInCycle('2026-09-05', 5)).toBe(30);
  });
});

describe('orçamento diário', () => {
  it('divide o saldo pelos dias restantes', () => {
    const budget = computeDailyBudget({
      balanceCents: 100_000,
      spentTodayCents: 0,
      settings,
      reference: '2026-09-01', // faltam 4 dias até 05/09
    });

    expect(budget.daysLeft).toBe(4);
    expect(budget.allowanceCents).toBe(25_000);
    expect(budget.remainingCents).toBe(25_000);
  });

  it('não encolhe a meta conforme o dia é gasto', () => {
    const budget = computeDailyBudget({
      balanceCents: 90_000, // já saíram 10.000 hoje
      spentTodayCents: 10_000,
      settings,
      reference: '2026-09-01',
    });

    expect(budget.allowanceCents).toBe(25_000);
    expect(budget.remainingCents).toBe(15_000);
    expect(budget.progress).toBeCloseTo(0.4);
  });

  it('desconta a reserva antes de dividir', () => {
    const budget = computeDailyBudget({
      balanceCents: 100_000,
      spentTodayCents: 0,
      settings: { reserveCents: 60_000, cycleStartDay: 5 },
      reference: '2026-09-01',
    });

    expect(budget.allowanceCents).toBe(10_000);
  });

  it('reporta saldo negativo quando o dia estoura', () => {
    const budget = computeDailyBudget({
      balanceCents: 60_000,
      spentTodayCents: 40_000,
      settings,
      reference: '2026-09-01',
    });

    expect(budget.allowanceCents).toBe(25_000);
    expect(budget.remainingCents).toBe(-15_000);
    expect(budget.progress).toBe(1);
  });

  it('zera a meta quando não há saldo livre', () => {
    const budget = computeDailyBudget({
      balanceCents: 0,
      spentTodayCents: 0,
      settings: { reserveCents: 50_000, cycleStartDay: 5 },
      reference: '2026-09-01',
    });

    expect(budget.allowanceCents).toBe(0);
    expect(budget.remainingCents).toBe(0);
  });
});
