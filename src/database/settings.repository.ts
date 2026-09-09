import type { Settings } from '../types';
import { getDatabase } from './db';

export const DEFAULT_SETTINGS: Settings = {
  reserveCents: 0,
  cycleStartDay: 1,
};

export async function loadSettings(): Promise<Settings> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    'SELECT key, value FROM settings',
  );

  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const reserve = Number(stored.get('reserveCents'));
  const cycleDay = Number(stored.get('cycleStartDay'));

  return {
    reserveCents: Number.isFinite(reserve) && reserve >= 0 ? reserve : DEFAULT_SETTINGS.reserveCents,
    cycleStartDay:
      Number.isFinite(cycleDay) && cycleDay >= 1 && cycleDay <= 31
        ? cycleDay
        : DEFAULT_SETTINGS.cycleStartDay,
  };
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  const db = await getDatabase();
  const entries = Object.entries(patch).filter(([, value]) => value !== undefined);

  await db.withTransactionAsync(async () => {
    for (const [key, value] of entries) {
      await db.runAsync(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [key, String(value)],
      );
    }
  });
}
