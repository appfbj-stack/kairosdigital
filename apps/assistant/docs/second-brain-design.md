# Obsidian como Second Brain do Kairós

**Data:** 2026-07-03
**Status:** Aprovado

## Visão Geral

O Obsidian vault (`C:\Users\ferna\OneDrive\Documentos\,COFRE SUBSEDIAN\`) será a memória persistente de todo o ecossistema Kairós. Agentes, ferramentas e o orquestrador consultam e escrevem neste vault como seu "segundo cérebro".

## Arquitetura

```
Usuário no Chat Kairós
       │
       ▼
Kairós Assistant (cloud)
  └── Orchestrator detecta necessidade de memória
       └── Envia WebSocket pro Kairós Agent (desktop)
            └── Agent lê/escreve no vault Obsidian
                 └── Retorna resultado → Assistant → Usuário
```

## Estrutura do Vault

```
cofre-subsedian/
└── kairos/
    ├── clientes/
    │   └── {cliente-slug}/
    │       ├── index.md          — resumo do cliente
    │       ├── preferencias.md   — configurações aprendidas
    │       ├── decisoes.md       — histórico de decisões
    │       └── ferramentas.md    — apps/tools ativos
    ├── agentes/
    │   ├── orquestrador.md       — regras do orchestrator
    │   ├── {agente-nome}.md      — aprendizado por agente
    │   └── memoria-global.md     — facts transversais
    ├── ferramentas/
    │   ├── {tool-name}.md        — documentação de cada tool
    │   └── padroes.md            — padrões de uso
    └── audit/                    — logs das operações do agent
        └── {yyyy-mm-dd}.md
```

## Módulo ObsidianVault (no Kairós Agent)

Novas tools no `FileSystemManager` do `kairos-agent`:

| Comando | Descrição |
|---------|-----------|
| `vault.search(query)` | Busca notas por conteúdo/título |
| `vault.read(path)` | Lê nota específica |
| `vault.write(path, content)` | Cria/atualiza nota |
| `vault.delete(path)` | Remove nota |
| `vault.list(folder)` | Lista notas por pasta |
| `vault.links(path)` | Lista [[links]] de uma nota |
| `vault.backlinks(path)` | Lista backlinks de uma nota |
| `vault.graph(path)` | Mapa de conexões (profundidade 1) |

## Integração no Orchestrator

O `PromptComposer` do `kairos-assistant` incluirá no system prompt:

> "Você tem acesso ao Second Brain do Kairós (vault Obsidian). Sempre que aprender algo novo sobre um cliente, ferramenta ou decisão, registre no vault. Consulte o vault antes de responder sobre um cliente."

## Ferramentas WebSocket (no Kairós Assistant)

Adicionar ao protocolo WebSocket existente no `kairos-assistant`:

- `vault_search` — busca no vault
- `vault_read` — lê nota
- `vault_write` — escreve nota
- `vault_list` — lista notas

## Próximos Passos

1. Criar estrutura inicial do vault (pastas + notas seed)
2. Implementar `ObsidianVault` no `kairos-agent`
3. Adicionar tools WebSocket no `kairos-assistant`
4. Modificar `PromptComposer` para incluir contexto do vault
5. Testar fluxo completo
