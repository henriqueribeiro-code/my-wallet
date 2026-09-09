import type { TransactionKind } from '../types';

export type RootTabParamList = {
  Hoje: undefined;
  Extrato: undefined;
  Novo: { kind?: TransactionKind } | undefined;
  Ajustes: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
