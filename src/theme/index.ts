/**
 * Direção visual: "cofre de veludo".
 * Base ameixa profunda, superfícies levemente arroxeadas, e dois acentos
 * semânticos — menta para entradas, damasco para saídas. O número do dia é o
 * único elemento realmente grande da tela; todo o resto é discreto.
 */

export const colors = {
  bg: '#1E1424',
  surface: '#2A1D33',
  surfaceRaised: '#35263F',
  line: '#453251',
  text: '#F4EDF6',
  textSoft: '#C6B3D0',
  textMuted: '#9A85A6',
  income: '#86E0B0',
  expense: '#F2A65A',
  danger: '#EF6461',
  onAccent: '#1E1424',
} as const;

export const spacing = (n: number) => n * 4;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const font = {
  display: 'Sora_600SemiBold',
  displayBold: 'Sora_700Bold',
  body: 'Sora_400Regular',
  bodyMedium: 'Sora_500Medium',
} as const;

export const type = {
  hero: { fontFamily: font.displayBold, fontSize: 46, letterSpacing: -1.6 },
  title: { fontFamily: font.display, fontSize: 22, letterSpacing: -0.4 },
  amount: { fontFamily: font.bodyMedium, fontSize: 16, letterSpacing: -0.2 },
  body: { fontFamily: font.body, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: font.bodyMedium, fontSize: 13, letterSpacing: 0.1 },
  caption: { fontFamily: font.body, fontSize: 12, lineHeight: 16 },
} as const;
