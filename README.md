# My Wallet

App de carteira pessoal em React Native com banco **100% local**. Registra entradas e saídas e responde à única pergunta que importa no dia a dia: **quanto eu posso gastar hoje?**

## Como rodar

```bash
npm install
npx expo start
```

Abra no Expo Go (Android/iOS) ou em um emulador. Não há backend, login nem chamada de rede — os dados ficam no SQLite do aparelho.

```bash
npm test        # testes da regra de orçamento
npm run typecheck
```

## A regra do gasto diário

```
saldoNoInícioDoDia = saldoAtual + gastoDeHoje
livre              = max(0, saldoNoInícioDoDia − reserva)
metaDoDia          = floor(livre ÷ diasRestantesNoCiclo)
sobraHoje          = metaDoDia − gastoDeHoje
```

Três decisões que vale explicar:

**O gasto de hoje é somado de volta antes de dividir.** Sem isso a meta encolheria a cada compra do próprio dia e o número nunca pararia quieto na tela.

**Não existe "dívida" acumulada.** Se você estourou ontem, o saldo já está menor hoje, então a meta cai sozinha na divisão do dia seguinte. Estourar não vira uma penalidade separada — vira menos dinheiro para os dias restantes, que é o que de fato acontece.

**O ciclo é configurável.** Você escolhe o dia em que o dinheiro entra (padrão: dia 1) e o app conta os dias até a próxima virada, incluindo hoje e excluindo o dia da virada. Dias 29–31 são encaixados no último dia de meses curtos.

## Arquitetura

```
App.tsx                     fontes + migrations antes de montar a UI
src/
  database/
    db.ts                   conexão única + migrations por PRAGMA user_version
    transactions.repository.ts
    settings.repository.ts
  context/WalletContext.tsx  estado global, um refresh consistente por mutação
  utils/
    money.ts                centavos → string; nunca float em cálculo
    date.ts                 YYYY-MM-DD em horário local
    dailyBudget.ts          regra de negócio pura e testada
  components/               primitivos + cartões
  screens/                  Hoje, Extrato, Novo, Ajustes
  navigation/               abas
```

### Decisões técnicas

**Dinheiro em centavos (`INTEGER`).** `0.1 + 0.2 !== 0.3` — em app financeiro isso vira centavo perdido. Float só aparece em `formatCents`, na borda da interface.

**Datas sem `toISOString()`.** Esse método converte para UTC; uma compra às 22h em Brasília seria gravada no dia seguinte. `src/utils/date.ts` formata sempre em horário local.

**Agregação no SQLite, não no JS.** Saldo, totais do ciclo, gasto do dia e ranking de categorias saem de queries com `SUM`/`GROUP BY`. Trazer 5 mil linhas para somar em JavaScript não escala e trava a lista.

**Migrations versionadas.** `PRAGMA user_version` controla o que já rodou, e cada migration sobe dentro de uma transação. Para evoluir o schema, acrescente uma função ao array `MIGRATIONS` — nunca edite uma já publicada.

**Regra de negócio isolada.** `dailyBudget.ts` não importa React nem SQLite, então dá para testar sem emulador e sem mock.

## O que dá para acrescentar depois

- Exportar CSV com `expo-file-system` + `expo-sharing`
- Lançamentos recorrentes (nova tabela + geração no boot)
- Metas por categoria, com aviso ao registrar
- Backup cifrado com `expo-secure-store` para a chave

## Observação

`Intl.NumberFormat` é usado na formatação. O Hermes do Expo SDK 51 já traz Intl completo; se você fizer downgrade para uma versão antiga do RN, troque `src/utils/money.ts` por formatação manual.
