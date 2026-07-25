# Second Brain Extensions — Implementation Plan (Tasks 4-7)

> **For agentic workers:** Use subagent-driven-development to implement task-by-task.

**Goal:** Extender o Second Brain do Kairós com MCP server (Claude Desktop), plugin Kairos App, API REST e agente de conhecimento.

**Architecture:** MCP server em Python (stdio), plugin seguindo kairos-app-pattern, API REST no NestJS, agente de auto-indexação como módulo assíncrono.

**Tech Stack:** Python 3.12+, MCP SDK, NestJS, Prisma, PostgreSQL

## Global Constraints

- Vault path: `~/.kairos-vault/` (ou `KAIROS_VAULT_PATH`)
- TDD: todo código novo com testes
- Commits atômicos por task
- Caminhos absolutos no Windows

---

### Task 4: MCP Server para Claude Desktop

**Files:**
- Create: `kairos-agent/src/tools/mcp_server.py`
- Create: `kairos-agent/tests/test_mcp_server.py`

**Interfaces:**
- Consumes: `ObsidianVault` (search, read, write, list, links, backlinks, graph)
- Produces: servidor MCP stdio com tools `vault_search`, `vault_read`, `vault_write`, `vault_list`, `vault_graph`

- [ ] **Step 1: Instalar MCP SDK**

```bash
cd C:\Users\ferna\kairos-agent && pip install mcp
```

- [ ] **Step 2: Criar MCP server**

```python
# src/tools/mcp_server.py
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
import mcp.types as types
from src.filesystem.obsidian_vault import ObsidianVault
import os

VAULT_PATH = os.environ.get(
    "KAIROS_VAULT_PATH",
    os.path.join(os.path.expanduser("~"), ".kairos-vault")
)

vault = ObsidianVault(VAULT_PATH)
server = Server("kairos-brain")

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="vault_search",
            description="Busca notas no vault do Kairós",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Termo de busca"}
                },
                "required": ["query"],
            },
        ),
        types.Tool(
            name="vault_read",
            description="Lê conteúdo de uma nota",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo da nota"}
                },
                "required": ["path"],
            },
        ),
        types.Tool(
            name="vault_write",
            description="Cria ou atualiza uma nota",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo"},
                    "content": {"type": "string", "description": "Conteúdo markdown"}
                },
                "required": ["path", "content"],
            },
        ),
        types.Tool(
            name="vault_list",
            description="Lista notas em uma pasta",
            inputSchema={
                "type": "object",
                "properties": {
                    "folder": {"type": "string", "description": "Pasta (vazio = raiz)"}
                },
            },
        ),
        types.Tool(
            name="vault_graph",
            description="Mapa de conexões de uma nota",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho da nota central"}
                },
                "required": ["path"],
            },
        ),
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    try:
        if name == "vault_search":
            result = vault.search(arguments["query"])
        elif name == "vault_read":
            result = vault.read(arguments["path"])
        elif name == "vault_write":
            result = vault.write(arguments["path"], arguments["content"])
        elif name == "vault_list":
            result = vault.list(arguments.get("folder", ""))
        elif name == "vault_graph":
            result = vault.graph(arguments["path"])
        else:
            raise ValueError(f"Tool desconhecida: {name}")
        return [types.TextContent(type="text", text=str(result))]
    except Exception as e:
        return [types.TextContent(type="text", text=f"Erro: {e}")]

async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="kairos-brain",
                server_version="0.1.0",
            ),
        )

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

- [ ] **Step 3: Escrever teste**

```python
# tests/test_mcp_server.py
import pytest
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
from tools.mcp_server import server, vault

def test_server_name():
    assert server.name == "kairos-brain"

def test_vault_loaded():
    assert vault is not None
```

- [ ] **Step 4: Instalar dependência e rodar testes**

```bash
cd C:\Users\ferna\kairos-agent && pip install mcp
cd C:\Users\ferna\kairos-agent && python -m pytest tests/test_mcp_server.py -v
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\ferna add kairos-agent/src/tools/mcp_server.py kairos-agent/tests/test_mcp_server.py
git -C C:\Users\ferna commit -m "feat: add MCP server for Claude Desktop (vault tools)"
```

---

### Task 5: Plugin Kairos App

**Files:**
- Create: `kairos-agent/src/kairos_integration.py`
- Test: `kairos-agent/tests/test_kairos_integration.py`

**Interfaces:**
- Consumes: `ObsidianVault`, `Engine`
- Produces: módulo de integração registrando vault como app do ecossistema

- [ ] **Step 1: Criar kairos_integration.py**

```python
# src/kairos_integration.py
from src.filesystem.obsidian_vault import ObsidianVault
import os

VAULT_PATH = os.environ.get(
    "KAIROS_VAULT_PATH",
    os.path.join(os.path.expanduser("~"), ".kairos-vault")
)

APP_REGISTRATION = {
    "name": "second-brain",
    "display_name": "Second Brain",
    "description": "Vault Obsidian como memória persistente do ecossistema Kairós",
    "version": "0.1.0",
    "tools": [
        "vault.search",
        "vault.read",
        "vault.write",
        "vault.list",
        "vault.links",
        "vault.backlinks",
        "vault.graph",
    ],
    "permissions": ["filesystem.read", "filesystem.write"],
}

def get_vault():
    return ObsidianVault(VAULT_PATH)

def get_registration():
    return APP_REGISTRATION
```

- [ ] **Step 2: Escrever teste e commit**

```python
def test_app_registration():
    from src.kairos_integration import get_registration
    reg = get_registration()
    assert reg["name"] == "second-brain"
    assert "vault.search" in reg["tools"]
```

---

### Task 6: API REST no NestJS (kairos-assistant backend)

**Files:**
- Create: `kairos-assistant/backend/src/vault/vault.module.ts`
- Create: `kairos-assistant/backend/src/vault/vault.controller.ts`
- Create: `kairos-assistant/backend/src/vault/vault.service.ts`
- Modify: `kairos-assistant/backend/src/app.module.ts`

- [ ] **Step 1-4: Criar módulo NestJS com controller REST**

Endpoints:
- `GET /api/vault/search?query=` → envia comando via WS Agent
- `GET /api/vault/read?path=` → lê nota
- `POST /api/vault/write` body `{path, content}` → escreve nota
- `GET /api/vault/list?folder=` → lista pasta

---

### Task 7: Agente de Conhecimento (auto-indexação)

**Files:**
- Create: `kairos-agent/src/tools/knowledge_indexer.py`
- Test: `kairos-agent/tests/test_knowledge_indexer.py`

- [ ] **Step 1-4: Criar indexador que na inicialização escaneia o vault e constrói índice de conhecimento**

Features:
- Scan inicial de todo vault
- Hash-based change detection
- Gera índice em `~/.kairos-vault/.cache/knowledge_index.json`
- Registra como task periódica no engine
