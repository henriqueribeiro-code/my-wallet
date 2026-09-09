import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { DailyBudget } from '../types';
import { formatCents, formatCentsPlain } from '../utils/money';
import { formatShort } from '../utils/date';
import { ProgressBar } from './primitives';

export function DailyBudgetCard({ budget }: { budget: DailyBudget }) {
  const overspent = budget.remainingCents < 0;
  const tint = overspent ? colors.danger : colors.income;

  const headline = overspent
    ? 'Você passou da meta de hoje'
    : budget.allowanceCents === 0
      ? 'Sem saldo livre para hoje'
      : 'Você pode gastar hoje';

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{headline}</Text>

      <View style={styles.heroRow}>
        <Text style={[styles.currency, { color: tint }]}>R$</Text>
        <Text
          accessibilityLabel={
            overspent
              ? `${formatCents(Math.abs(budget.remainingCents))} acima da meta de hoje`
              : `${formatCents(Math.abs(budget.remainingCents))} disponíveis hoje`
          }
          style={[styles.hero, { color: tint }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCentsPlain(Math.abs(budget.remainingCents))}
        </Text>
      </View>

      <ProgressBar value={budget.progress} tint={tint} />

      <View style={styles.meta}>
        <Metric label="Meta do dia" value={formatCents(budget.allowanceCents)} />
        <Metric label="Já gastei" value={formatCents(budget.spentTodayCents)} />
        <Metric
          label="Ciclo reinicia"
          value={`${formatShort(budget.cycleEndsOn)} · ${budget.daysLeft}d`}
        />
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(6),
    gap: spacing(4),
  },
  eyebrow: {
    ...type.body,
    color: colors.textSoft,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(2),
  },
  currency: {
    ...type.title,
    fontSize: 18,
    marginTop: spacing(2),
    opacity: 0.7,
  },
  hero: {
    ...type.hero,
    flexShrink: 1,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing(3),
  },
  metric: {
    flex: 1,
    gap: spacing(1),
  },
  metricLabel: {
    ...type.caption,
    color: colors.textMuted,
  },
  metricValue: {
    ...type.label,
    color: colors.text,
  },
});
