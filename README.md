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
