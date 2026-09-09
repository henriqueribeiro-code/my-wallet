import type { TransactionKind } from '../types';

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Mercado',
  'Saúde',
  'Lazer',
  'Compras',
  'Assinaturas',
  'Outros',
] as const;

export const INCOME_CATEGORIES = [
  'Salário',
  'Freela',
  'Venda',
  'Rendimento',
  'Presente',
  'Outros',
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  Alimentação: '🍽️',
  Transporte: '🚌',
  Moradia: '🏠',
  Mercado: '🛒',
  Saúde: '💊',
  Lazer: '🎬',
  Compras: '🛍️',
  Assinaturas: '🔁',
  Salário: '💼',
  Freela: '🧑‍💻',
  Venda: '🏷️',
  Rendimento: '📈',
  Presente: '🎁',
  Outros: '•',
};

export function categoriesFor(kind: TransactionKind): readonly string[] {
  return kind === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
