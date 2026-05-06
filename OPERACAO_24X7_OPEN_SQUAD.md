# Operação 24/7 com OpenSquad (Arquitetura Replicável)

Este guia descreve como rodar squads além da IDE, em operação contínua, com observabilidade e recuperação automática.

## Objetivo
Transformar squads em rotinas de produção com:
- agendamento (`cron`)
- disparo por evento (`webhook`)
- checkpoints para aprovação humana
- logs e histórico de execução
- retry e fallback

## Modelo de execução

### 1) Build-time (IDE)
Use a IDE para criar/editar:
- `squad.yaml`
- agentes e tasks
- pipeline e checkpoints

### 2) Run-time (24/7)
Execute por automação:
- `cron` para rotinas periódicas
- `webhook` para eventos
- runner de pipeline para processar filas

> Regra prática: **IDE para engenharia do fluxo; runtime para operação contínua.**

## Padrão mínimo por squad

```text
squads/<slug>/
  squad.yaml
  agents/
  pipeline/
  _memory/
```

Recomendado para rastreabilidade:
- outputs versionados por run (timestamp)
- arquivo de resumo por execução
- registro de decisão nos checkpoints

## Exemplo de agenda operacional

- 07:00 — coletar tendências
- 12:00 — gerar ângulos e pré-copy
- 18:00 — revisão + decisão de publicação

## Checkpoints obrigatórios (conteúdo)
1. aprovação de briefing
2. aprovação de ângulo
3. aprovação de copy
4. decisão final de publicação

## Observabilidade (KPIs)
Acompanhe por squad:
- tempo por step
- taxa de aprovação em checkpoint
- taxa de erro por step
- custo por execução
- throughput diário (runs concluídas)

## Confiabilidade

### Retry com backoff
Para falhas transitórias (API/timeout), aplicar tentativas com espera progressiva.

### Idempotência
Cada execução deve ter `run_id` e evitar duplicar publicação/efeito colateral.

### Fallback de provider/modelo
Quando o provider principal falhar, redirecionar para fallback preservando o contexto mínimo necessário.

## Segurança e governança
- checkpoints antes de qualquer ação externa irreversível
- segregação de permissões por agente
- mascaramento de credenciais em logs
- trilha de auditoria por execução

## Playbook de incidentes (resumo)
1. detectar (alerta/KPI)
2. classificar (P0–P3)
3. conter (pause em jobs afetados)
4. remediar (fallback/retry/rollback)
5. validar (smoke run)
6. registrar causa raiz

## Como replicar em outro projeto
1. copiar blueprint da squad base
2. ajustar papéis e steps
3. configurar agendamentos (cron)
4. plugar webhooks de entrada
5. ligar dashboards de KPI
6. rodar semana piloto e calibrar SLAs

## Resultado esperado
Com esse padrão, squads deixam de ser execuções manuais pontuais e passam a operar como um sistema de produção multiagente, auditável e escalável.
