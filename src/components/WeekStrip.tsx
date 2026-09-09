import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '../theme';
import type { DaySpending } from '../types';
import { addDays, fromISODate, today, weekdayInitial } from '../utils/date';
import { formatCents } from '../utils/money';
import { Surface } from './primitives';

const BAR_AREA = 76;

interface Props {
  days: DaySpending[];
  allowanceCents: number;
}

/**
 * Sete colunas, uma por dia. A linha tracejada é a meta diária: barra abaixo
 * dela é dia dentro do orçamento, acima dela é estouro.
 */
export function WeekStrip({ days, allowanceCents }: Props) {
  const reference = today();

  const series = useMemo(() => {
    const byDate = new Map(days.map((day) => [day.date, day.spentCents]));
    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(reference, index - 6);
      return { date, spentCents: byDate.get(date) ?? 0 };
    });
  }, [days, reference]);

  const peak = Math.max(allowanceCents, ...series.map((day) => day.spentCents), 1);
  const targetOffset = allowanceCents > 0 ? BAR_AREA * (1 - allowanceCents / peak) : null;

  return (
    <Surface style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Últimos 7 dias</Text>
        {allowanceCents > 0 && <Text style={styles.legend}>meta {formatCents(allowanceCents)}</Text>}
      </View>

      <View style={styles.chart}>
        {targetOffset !== null && <View style={[styles.target, { top: targetOffset }]} />}

        {series.map((day) => {
          const over = allowanceCents > 0 && day.spentCents > allowanceCents;
          const height = Math.max(3, BAR_AREA * (day.spentCents / peak));
          const isToday = day.date === reference;

          return (
            <View key={day.date} style={styles.column}>
              <View style={styles.slot}>
                <View
                  accessibilityLabel={`${day.date}: ${formatCents(day.spentCents)}`}
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: over ? colors.danger : colors.expense,
                      opacity: day.spentCents === 0 ? 0.22 : 1,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {weekdayInitial(day.date)}
              </Text>
              <Text style={styles.dayNumber}>{fromISODate(day.date).getDate()}</Text>
            </View>
          );
        })}
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing(4),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  title: {
    ...type.label,
    color: colors.text,
  },
  legend: {
    ...type.caption,
    color: colors.textMuted,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  target: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.line,
  },
  column: {
    alignItems: 'center',
    width: 32,
  },
  slot: {
    height: BAR_AREA,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 12,
    borderRadius: radius.pill,
  },
  dayLabel: {
    ...type.caption,
    color: colors.textMuted,
    marginTop: spacing(2),
  },
  dayLabelToday: {
    color: colors.text,
  },
  dayNumber: {
    ...type.caption,
    fontSize: 11,
    color: colors.textSoft,
  },
});
