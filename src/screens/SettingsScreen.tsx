import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Caption, Chip, Divider, Surface } from '../components/primitives';
import { useWallet } from '../context/WalletContext';
import { colors, radius, spacing, type } from '../theme';
import { formatCents, formatCentsPlain, digitsToCents } from '../utils/money';

const CYCLE_DAYS = [1, 5, 10, 15, 20, 25, 28, 30, 31];

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, topCategories, clearAllData, budget } = useWallet();

  const [reserveDraft, setReserveDraft] = useState(settings.reserveCents);

  // Mantém o campo em sincronia se as configurações mudarem em outro lugar.
  useEffect(() => setReserveDraft(settings.reserveCents), [settings.reserveCents]);

  const dirty = reserveDraft !== settings.reserveCents;

  const confirmClear = () => {
    Alert.alert(
      'Limpar todos os dados?',
      'Lançamentos e ajustes serão apagados deste aparelho. Não há como desfazer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: () => void clearAllData() },
      ],
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(10) },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Ajustes</Text>

      <Surface style={styles.block}>
        <Text style={styles.blockTitle}>Reserva intocável</Text>
        <Caption>
          Esse valor fica de fora da conta do gasto diário. Serve para emergência ou para uma
          despesa que já tem dono.
        </Caption>

        <View style={styles.inputRow}>
          <Text style={styles.currency}>R$</Text>
          <TextInput
            style={styles.input}
            value={formatCentsPlain(reserveDraft)}
            onChangeText={(text) => setReserveDraft(digitsToCents(text))}
            keyboardType="number-pad"
            selectTextOnFocus
            accessibilityLabel="Valor da reserva"
          />
        </View>

        <Button
          label={dirty ? 'Salvar reserva' : 'Reserva salva'}
          disabled={!dirty}
          onPress={() => void updateSettings({ reserveCents: reserveDraft })}
        />
      </Surface>

      <Surface style={styles.block}>
        <Text style={styles.blockTitle}>Dia em que o ciclo reinicia</Text>
        <Caption>
          Normalmente o dia em que seu dinheiro entra. O app divide o saldo livre pelos dias que
          faltam até lá.
        </Caption>

        <View style={styles.chips}>
          {CYCLE_DAYS.map((day) => (
            <Chip
              key={day}
              label={`Dia ${day}`}
              selected={settings.cycleStartDay === day}
              onPress={() => void updateSettings({ cycleStartDay: day })}
            />
          ))}
        </View>

        <Caption>
          Faltam {budget.daysLeft} {budget.daysLeft === 1 ? 'dia' : 'dias'} no ciclo atual.
        </Caption>
      </Surface>

      <Surface style={styles.block}>
        <Text style={styles.blockTitle}>Onde seu dinheiro foi neste ciclo</Text>
        {topCategories.length === 0 ? (
          <Caption>Nenhuma saída registrada ainda.</Caption>
        ) : (
          topCategories.map((item, index) => (
            <View key={item.category}>
              <View style={styles.categoryRow}>
                <Text style={styles.categoryName}>{item.category}</Text>
                <Text style={styles.categoryValue}>{formatCents(item.totalCents)}</Text>
              </View>
              {index < topCategories.length - 1 && <Divider />}
            </View>
          ))
        )}
      </Surface>

      <Surface style={styles.block}>
        <Text style={styles.blockTitle}>Dados</Text>
        <Caption>
          Tudo fica salvo apenas neste aparelho, em um banco SQLite local. Nada é enviado para
          servidores.
        </Caption>
        <Button label="Limpar todos os dados" variant="danger" onPress={confirmClear} />
      </Surface>
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
    gap: spacing(4),
  },
  heading: {
    ...type.title,
    color: colors.text,
  },
  block: {
    gap: spacing(3),
  },
  blockTitle: {
    ...type.label,
    color: colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    paddingHorizontal: spacing(4),
  },
  currency: {
    ...type.label,
    color: colors.textMuted,
  },
  input: {
    ...type.title,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing(3.5),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing(2.5),
  },
  categoryName: {
    ...type.body,
    color: colors.textSoft,
  },
  categoryValue: {
    ...type.amount,
    color: colors.text,
  },
});
