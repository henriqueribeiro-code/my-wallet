/**
 * Datas são persistidas como 'YYYY-MM-DD' em horário local.
 * Evitamos `toISOString()` de propósito: ele converte para UTC e, no Brasil,
 * joga transações da noite para o dia seguinte.
 */

const MS_PER_DAY = 86_400_000;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function today(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Diferença em dias inteiros (b - a), imune a horário de verão. */
export function diffInDays(a: string, b: string): number {
  const start = fromISODate(a).getTime();
  const end = fromISODate(b).getTime();
  return Math.round((end - start) / MS_PER_DAY);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const MONTHS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

export function formatShort(iso: string): string {
  const d = fromISODate(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

export function formatLong(iso: string): string {
  const d = fromISODate(iso);
  return `${WEEKDAYS[d.getDay()]}, ${formatShort(iso)}`;
}

export function weekdayInitial(iso: string): string {
  const label = WEEKDAYS[fromISODate(iso).getDay()] ?? '';
  return label.charAt(0).toUpperCase();
}

/** Rótulo humano para agrupar a lista de lançamentos. */
export function relativeLabel(iso: string, reference = today()): string {
  const delta = diffInDays(iso, reference);
  if (delta === 0) return 'Hoje';
  if (delta === 1) return 'Ontem';
  return formatLong(iso);
}
