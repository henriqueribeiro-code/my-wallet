import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { Button, Caption, Chip } from '../components/primitives';
import { categoriesFor } from '../constants/categories';
import { useWallet } from '../context/WalletContext';
import { colors, radius, spacing, type } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { TransactionKind } from '../types';
import { addDays, formatLong, today } from '../utils/date';
import { digitsToCents, formatCentsPlain } from '../utils/money';

type Props = BottomTabScreenProps<RootTabParamList, 'Novo'>;

export function AddTransactionScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { addTransaction, budget } = useWallet();

  const [kind, setKind] = useState<TransactionKind>(route.params?.kind ?? 'expense');
  const [amountCents, setAmountCents] = useState(0);
  const [category, setCategory] = useState<string>(categoriesFor(kind)[0] ?? 'Outros');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sincroniza o tipo quando o usuário navega pelos botões da HomeScreen
  useEffect(() => {
    if (route.params?.kind) {
      setKind(route.params.kind);
      setCategory(categoriesFor(route.params.kind)[0] ?? 'Outros');
      setError(null);
    }
  }, [route.params?.kind]);

  const tint = kind === 'income' ? colors.income : colors.expense;
  const categories = useMemo(() => categoriesFor(kind), [kind]);

  const switchKind = (next: TransactionKind) => {
    setKind(next);
    setCategory(categoriesFor(next)[0] ?? 'Outros');
    setError(null);
  };

  const reset = () => {
    setAmountCents(0);
    setNote('');
    setDate(today());
  };

  const submit = async () => {
    if (amountCents <= 0) {
      setError('Digite um valor maior que zero.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addTransaction({
        kind,
        amountCents,
        category,
        note: note.trim() ? note.trim() : null,
        date,
      });
      reset();
      navigation.setParams({ kind: undefined });
      navigation.navigate('Hoje');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const remainingAfter = budget.remainingCents - amountCents;
  const impact =
    kind === 'expense' && amountCents > 0
      ? remainingAfter >= 0
        ? `Sobram ${formatCentsPlain(remainingAfter)} da meta de hoje`
        : `Você passará R$ ${formatCentsPlain(Math.abs(remainingAfter))} da meta de hoje`
      : null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(10) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Novo lançamento</Text>

        <View style={styles.switcher}>
          <Chip
            label="Saída"
            selected={kind === 'expense'}
            tint={colors.expense}
            onPress={() => switchKind('expense')}
          />
          <Chip
            label="Entrada"
            selected={kind === 'income'}
            tint={colors.income}
            onPress={() => switchKind('income')}
          />
        </View>

        <View style={styles.amountBox}>
          <Text style={[styles.currency, { color: tint }]}>R$</Text>
          <TextInput
            style={[styles.amountInput, { color: tint }]}
            value={formatCentsPlain(amountCents)}
            onChangeText={(text) => {
              setAmountCents(digitsToCents(text));
              setError(null);
            }}
            keyboardType="number-pad"
            selectTextOnFocus
            accessibilityLabel="Valor do lançamento"
          />
        </View>

        {impact && <Caption style={styles.impact}>{impact}</Caption>}

        <Field label="Categoria">
          <View style={styles.chips}>
            {categories.map((item) => (
              <Chip
                key={item}
                label={item}
                tint={tint}
                selected={category === item}
                onPress={() => setCategory(item)}
              />
            ))}
          </View>
        </Field>

        <Field label="Quando">
          <View style={styles.chips}>
            <Chip
              label="Hoje"
              tint={tint}
              selected={date === today()}
              onPress={() => setDate(today())}
            />
            <Chip
              label="Ontem"
              tint={tint}
              selected={date === addDays(today(), -1)}
              onPress={() => setDate(addDays(today(), -1))}
            />
            <Chip
              label="Anteontem"
              tint={tint}
              selected={date === addDays(today(), -2)}
              onPress={() => setDate(addDays(today(), -2))}
            />
          </View>
          <Caption>{formatLong(date)}</Caption>
        </Field>

        <Field label="Descrição (opcional)">
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Almoço com a equipe"
            placeholderTextColor={colors.textMuted}
            maxLength={80}
          />
        </Field>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          label={kind === 'income' ? 'Salvar entrada' : 'Salvar saída'}
          tint={tint}
          loading={saving}
          onPress={submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
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
  heading: {
    ...type.title,
    color: colors.text,
  },
  switcher: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(5),
  },
  currency: {
    ...type.title,
    fontSize: 18,
    opacity: 0.7,
  },
  amountInput: {
    ...type.hero,
    fontSize: 38,
    flex: 1,
    padding: 0,
  },
  impact: {
    marginTop: -spacing(3),
  },
  field: {
    gap: spacing(3),
  },
  fieldLabel: {
    ...type.label,
    color: colors.textSoft,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  noteInput: {
    ...type.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3.5),
  },
  error: {
    ...type.caption,
    color: colors.danger,
  },
});
