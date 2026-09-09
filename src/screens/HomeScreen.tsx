import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { BalanceCard } from '../components/BalanceCard';
import { DailyBudgetCard } from '../components/DailyBudgetCard';
import { WeekStrip } from '../components/WeekStrip';
import { EmptyState, TransactionItem } from '../components/TransactionItem';
import { Button, Divider, SectionTitle } from '../components/primitives';
import { useWallet } from '../context/WalletContext';
import { colors, spacing, type } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import { formatLong, today } from '../utils/date';

type Props = BottomTabScreenProps<RootTabParamList, 'Hoje'>;

export function HomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const {
    budget,
    totals,
    settings,
    transactions,
    lastSevenDays,
    cycleStart,
    refreshing,
    refresh,
    removeTransaction,
  } = useWallet();

  const recent = transactions.slice(0, 5);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(10) },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textSoft} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>My Wallet</Text>
        <Text style={styles.date}>{formatLong(today())}</Text>
      </View>

      <DailyBudgetCard budget={budget} />

      <View style={styles.actions}>
        <Button
          label="Registrar saída"
          tint={colors.expense}
          onPress={() => navigation.navigate('Novo', { kind: 'expense' })}
          style={styles.action}
        />
        <Button
          label="Registrar entrada"
          tint={colors.income}
          onPress={() => navigation.navigate('Novo', { kind: 'income' })}
          style={styles.action}
        />
      </View>

      <BalanceCard totals={totals} settings={settings} cycleStart={cycleStart} />

      <WeekStrip days={lastSevenDays} allowanceCents={budget.allowanceCents} />

      <View>
        <SectionTitle>Últimos lançamentos</SectionTitle>
        {recent.length === 0 ? (
          <EmptyState
            title="Nada registrado ainda"
            message="Registre uma entrada para o app calcular quanto você pode gastar por dia."
          />
        ) : (
          recent.map((item, index) => (
            <View key={item.id}>
              <TransactionItem transaction={item} onDelete={removeTransaction} />
              {index < recent.length - 1 && <Divider />}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing(5),
    gap: spacing(5),
  },
  header: {
    gap: spacing(1),
  },
  greeting: {
    ...type.title,
    color: colors.text,
  },
  date: {
    ...type.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  action: {
    flex: 1,
  },
});
