# Estrutura de Tópicos + Squads Setoriais

## Objetivo
Organizar a execução em sessões por área para reduzir sobrecarga de contexto na sessão principal e melhorar handoff entre frentes.

## Princípio de operação
- Sessão principal: direção, prioridade, aprovações e bloqueios.
- Tópicos setoriais: execução detalhada por squad.
- Fechamento de ciclo: cada squad devolve resumo curto para a sessão principal.

## Tópicos propostos (Telegram)
1. `00-orquestracao-executiva`
2. `01-comercial-sdr`
3. `02-comercial-closer`
4. `03-trafego-performance`
5. `04-marketing-conteudo`
6. `05-design-criativo`
7. `06-operacoes-suporte`

## Mapeamento tópico -> squad (OpenSquad)
- `00-orquestracao-executiva` -> `orquestracao-executiva`
- `01-comercial-sdr` -> `comercial-sdr`
- `02-comercial-closer` -> `comercial-closer`
- `03-trafego-performance` -> `trafego-performance`
- `04-marketing-conteudo` -> `marketing-conteudo`
- `05-design-criativo` -> `design-criativo`
- `06-operacoes-suporte` -> `operacoes-suporte`

## Protocolo de handoff
1. Toda demanda entra no tópico setorial correto.
2. Se depender de outro setor, abrir handoff com:
   - contexto curto
   - objetivo
   - prazo
   - definição de pronto
3. A orquestração consolida prioridades e bloqueios no tópico executivo.

## SLA sugerido
- P0: resposta inicial em até 15 min
- P1: resposta inicial em até 1h
- P2: resposta inicial em até 4h
- P3: resposta inicial até D+1

## Estrutura criada em `squads/`
- `orquestracao-executiva`
- `comercial-sdr`
- `comercial-closer`
- `trafego-performance`
- `marketing-conteudo`
- `design-criativo`
- `operacoes-suporte`
