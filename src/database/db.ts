import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'my-wallet.db';

/**
 * Migrations são aplicadas em ordem e controladas por `PRAGMA user_version`.
 * Nunca edite uma migration já publicada — acrescente uma nova ao final.
 */
const MIGRATIONS: Array<(db: SQLite.SQLiteDatabase) => Promise<void>> = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE transactions (
        id          TEXT PRIMARY KEY NOT NULL,
        kind        TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        category    TEXT NOT NULL,
        note        TEXT,
        date        TEXT NOT NULL,
        created_at  TEXT NOT NULL
      );

      CREATE INDEX idx_transactions_date ON transactions (date DESC);
      CREATE INDEX idx_transactions_kind_date ON transactions (kind, date);

      CREATE TABLE settings (
        key   TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);
  },
];

let connection: SQLite.SQLiteDatabase | null = null;
let bootstrap: Promise<SQLite.SQLiteDatabase> | null = null;

async function migrate(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  while (version < MIGRATIONS.length) {
    const migration = MIGRATIONS[version];
    if (!migration) break;

    // Cada migration é atômica: ou sobe inteira, ou nada muda.
    await db.withTransactionAsync(async () => {
      await migration(db);
    });

    version += 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

/** Abre (uma única vez) a conexão e garante o schema atualizado. */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (connection) return Promise.resolve(connection);
  if (bootstrap) return bootstrap;

  bootstrap = (async () => {
    const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
    await migrate(db);
    connection = db;
    return db;
  })();

  return bootstrap;
}

/** Apaga todos os dados mantendo o schema. Usado pelo "Limpar dados". */
export async function resetDatabase(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM settings');
  });
}
