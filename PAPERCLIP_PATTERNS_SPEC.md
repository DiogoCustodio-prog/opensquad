# Spec funcional — Padrões Paperclip aplicados ao Opensquad

## Princípios
1. Não substituir o motor do Opensquad.
2. Adicionar camadas de controle operacional.
3. Garantir compatibilidade retroativa.
4. Habilitar rollout por feature flags.

## Feature flags propostas
- OPENSQUAD_TICKETS_ENABLED
- OPENSQUAD_GOAL_TRACE_ENABLED
- OPENSQUAD_BUDGET_GUARD_ENABLED
- OPENSQUAD_GOVERNANCE_ENABLED
- OPENSQUAD_AUDIT_TRAIL_ENABLED

## Fluxo alvo
1. Abrir ticket ao iniciar run.
2. Vincular goal ancestry.
3. Verificar budget antes de etapas críticas.
4. Aplicar gates de aprovação configurados.
5. Registrar eventos de auditoria.
6. Fechar ticket com status final.

## Mapeamento inicial
- `src/runs.js`: lifecycle da execução
- `src/agents.js`: contexto/guardrails por agente
- `src/logger.js`: eventos estruturados

## Estratégia incremental
- Etapa 1: observabilidade sem bloqueio
- Etapa 2: tickets + auditoria habilitados
- Etapa 3: budget em modo aviso
- Etapa 4: governança com gates opcionais
- Etapa 5: hard-stop por política
