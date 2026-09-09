import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '../theme';
import type { Settings, WalletTotals } from '../types';
import { formatCents } from '../utils/money';
import { formatShort } from '../utils/date';
import { Divider, Surface } from './primitives';

interface Props {
  totals: WalletTotals;
  settings: Settings;
  cycleStart: string;
}

export function BalanceCard({ totals, settings, cycleStart }: Props) {
  const free = totals.balanceCents - settings.reserveCents;

  return (
    <Surface style={styles.card}>
      <View>
        <Text style={styles.label}>Na carteira</Text>
        <Text style={styles.balance}>{formatCents(totals.balanceCents)}</Text>
      </View>

      <Divider />

      <View style={styles.row}>
        <Line
          label={`Entrou desde ${formatShort(cycleStart)}`}
          value={formatCents(totals.incomeCycleCents)}
          tint={colors.income}
        />
        <Line
          label="Saiu no mesmo período"
          value={formatCents(totals.expenseCycleCents)}
          tint={colors.expense}
        />
      </View>

      {settings.reserveCents > 0 && (
        <Text style={styles.reserve}>
          {formatCents(settings.reserveCents)} guardados como reserva ·{' '}
          {formatCents(Math.max(0, free))} livres
        </Text>
      )}
    </Surface>
  );
}

function Line({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <View style={styles.line}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <View style={styles.lineText}>
        <Text style={styles.lineLabel}>{label}</Text>
        <Text style={styles.lineValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing(4),
  },
  label: {
    ...type.caption,
    color: colors.textMuted,
    marginBottom: spacing(1),
  },
  balance: {
    ...type.title,
    fontSize: 30,
    color: colors.text,
  },
  row: {
    gap: spacing(3),
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lineText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing(2),
  },
  lineLabel: {
    ...type.caption,
    color: colors.textSoft,
    flexShrink: 1,
  },
  lineValue: {
    ...type.amount,
    color: colors.text,
  },
  reserve: {
    ...type.caption,
    color: colors.textMuted,
  },
});
