import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { Transaction } from '../types';
import { CATEGORY_ICONS } from '../constants/categories';
import { formatSigned } from '../utils/money';

interface Props {
  transaction: Transaction;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onDelete }: Props) {
  const isIncome = transaction.kind === 'income';
  const tint = isIncome ? colors.income : colors.expense;

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      'Apagar lançamento?',
      `${transaction.category} · ${formatSigned(transaction.amountCents, transaction.kind)}`,
      [
        { text: 'Manter', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => onDelete(transaction.id) },
      ],
    );
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={onDelete ? 'Toque e segure para apagar' : undefined}
      onLongPress={confirmDelete}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={[styles.icon, { borderColor: tint }]}>
        <Text style={styles.iconGlyph}>
          {CATEGORY_ICONS[transaction.category] ?? (isIncome ? '↓' : '↑')}
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.category}>{transaction.category}</Text>
        {transaction.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {transaction.note}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.amount, { color: tint }]}>
        {formatSigned(transaction.amountCents, transaction.kind)}
      </Text>
    </Pressable>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
  },
  rowPressed: {
    opacity: 0.6,
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  iconGlyph: {
    fontSize: 17,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  category: {
    ...type.label,
    color: colors.text,
  },
  note: {
    ...type.caption,
    color: colors.textMuted,
  },
  amount: {
    ...type.amount,
  },
  empty: {
    paddingVertical: spacing(10),
    alignItems: 'center',
    gap: spacing(2),
  },
  emptyTitle: {
    ...type.label,
    color: colors.text,
  },
  emptyMessage: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
});
