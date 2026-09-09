import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../database/settings.repository';
import { resetDatabase } from '../database/db';
import {
  deleteTransaction,
  getSpendingByDay,
  getSpentOn,
  getTopCategories,
  getTotals,
  insertTransaction,
  listTransactions,
} from '../database/transactions.repository';
import type {
  DailyBudget,
  DaySpending,
  NewTransaction,
  Settings,
  Transaction,
  WalletTotals,
} from '../types';
import { addDays, today } from '../utils/date';
import { computeDailyBudget, currentCycleStart } from '../utils/dailyBudget';

interface WalletState {
  ready: boolean;
  refreshing: boolean;
  transactions: Transaction[];
  totals: WalletTotals;
  settings: Settings;
  budget: DailyBudget;
  lastSevenDays: DaySpending[];
  topCategories: Array<{ category: string; totalCents: number }>;
  cycleStart: string;
  refresh: () => Promise<void>;
  addTransaction: (input: NewTransaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const EMPTY_TOTALS: WalletTotals = {
  balanceCents: 0,
  incomeCycleCents: 0,
  expenseCycleCents: 0,
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<WalletTotals>(EMPTY_TOTALS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [spentToday, setSpentToday] = useState(0);
  const [lastSevenDays, setLastSevenDays] = useState<DaySpending[]>([]);
  const [topCategories, setTopCategories] = useState<
    Array<{ category: string; totalCents: number }>
  >([]);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const currentSettings = await loadSettings();
      const reference = today();
      const cycleStart = currentCycleStart(reference, currentSettings.cycleStartDay);

      // Uma leitura consistente por refresh: tudo em paralelo, um setState por fatia.
      const [list, walletTotals, todaySpending, week, categories] = await Promise.all([
        listTransactions(),
        getTotals(cycleStart),
        getSpentOn(reference),
        getSpendingByDay(addDays(reference, -6), reference),
        getTopCategories(cycleStart),
      ]);

      setSettings(currentSettings);
      setTransactions(list);
      setTotals(walletTotals);
      setSpentToday(todaySpending);
      setLastSevenDays(week);
      setTopCategories(categories);
    } finally {
      setRefreshing(false);
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addTransaction = useCallback(
    async (input: NewTransaction) => {
      await insertTransaction(input);
      await load();
    },
    [load],
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
      await load();
    },
    [load],
  );

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      await saveSettings(patch);
      await load();
    },
    [load],
  );

  const clearAllData = useCallback(async () => {
    await resetDatabase();
    await load();
  }, [load]);

  const budget = useMemo(
    () =>
      computeDailyBudget({
        balanceCents: totals.balanceCents,
        spentTodayCents: spentToday,
        settings,
      }),
    [totals.balanceCents, spentToday, settings],
  );

  const cycleStart = useMemo(
    () => currentCycleStart(today(), settings.cycleStartDay),
    [settings.cycleStartDay],
  );

  const value = useMemo<WalletState>(
    () => ({
      ready,
      refreshing,
      transactions,
      totals,
      settings,
      budget,
      lastSevenDays,
      topCategories,
      cycleStart,
      refresh: load,
      addTransaction,
      removeTransaction,
      updateSettings,
      clearAllData,
    }),
    [
      ready,
      refreshing,
      transactions,
      totals,
      settings,
      budget,
      lastSevenDays,
      topCategories,
      cycleStart,
      load,
      addTransaction,
      removeTransaction,
      updateSettings,
      clearAllData,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet precisa estar dentro de <WalletProvider>.');
  }
  return context;
}
