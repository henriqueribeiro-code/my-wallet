import React, { useMemo } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, TransactionItem } from '../components/TransactionItem';
import { Divider } from '../components/primitives';
import { useWallet } from '../context/WalletContext';
import { colors, spacing, type } from '../theme';
import type { Transaction } from '../types';
import { relativeLabel } from '../utils/date';
import { formatCents } from '../utils/money';

interface Section {
  key: string;
  title: string;
  netCents: number;
  data: Transaction[];
}

export function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, refreshing, refresh, removeTransaction } = useWallet();

  const sections = useMemo<Section[]>(() => {
    const groups = new Map<string, Transaction[]>();
    for (const item of transactions) {
      const bucket = groups.get(item.date);
      if (bucket) bucket.push(item);
      else groups.set(item.date, [item]);
    }

    return Array.from(groups.entries()).map(([date, data]) => ({
      key: date,
      title: relativeLabel(date),
      netCents: data.reduce(
        (total, item) =>
          total + (item.kind === 'income' ? item.amountCents : -item.amountCents),
        0,
      ),
      data,
    }));
  }, [transactions]);

  return (
    <SectionList
      style={styles.screen}
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(10) },
      ]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.textSoft} />
      }
      ListHeaderComponent={<Text style={styles.heading}>Extrato</Text>}
      ListEmptyComponent={
        <EmptyState
          title="Extrato vazio"
          message="Tudo que você registrar aparece aqui, agrupado por dia."
        />
      }
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text
            style={[
              styles.sectionNet,
              { color: section.netCents >= 0 ? colors.income : colors.expense },
            ]}
          >
            {formatCents(section.netCents)}
          </Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TransactionItem transaction={item} onDelete={removeTransaction} />
      )}
      ItemSeparatorComponent={Divider}
      SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing(5),
  },
  heading: {
    ...type.title,
    color: colors.text,
    marginBottom: spacing(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingBottom: spacing(1),
  },
  sectionTitle: {
    ...type.label,
    color: colors.textSoft,
  },
  sectionNet: {
    ...type.caption,
  },
  sectionGap: {
    height: spacing(4),
  },
});
