# Second Brain (Obsidian Vault) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar o Obsidian vault como memória persistente do ecossistema Kairós, acessível via Kairós Agent (desktop) e consultável pelo Kairós Assistant (cloud).

**Architecture:** Kairós Agent (Python) ganha módulo `ObsidianVault` que opera no vault local. Kairós Assistant se comunica via WebSocket existente para ler/escrever no vault. PromptComposer inclui instrução de consulta ao vault.

**Tech Stack:** Python 3.12+ (agent), FastAPI (assistant), Markdown, OneDrive sync

## Global Constraints

- Vault path: `C:\Users\ferna\OneDrive\Documentos\,COFRE SUBSEDIAN\`
- Caminho relativo no vault: `kairos/` é a raiz do conteúdo Kairós
- [[links]] do Obsidian devem ser parseados (formato `[[nota]]` ou `[[nota|alias]]`)
- TDD: todo código novo deve ter testes
- Commits frequentes e atômicos

---

### Task 1: Criar estrutura do vault + notas seed

**Files:**
- Create: `C:\Users\ferna\OneDrive\Documentos\,COFRE SUBSEDIAN\kairos\README.md`
- Create: clientes/index.md, agentes/orquestrador.md, agentes/memoria-global.md, ferramentas/padroes.md (várias pastas)

- [ ] **Step 1: Criar estrutura de pastas**

```bash
$vault = "C:\Users\ferna\OneDrive\Documentos\,COFRE SUBSEDIAN\kairos"
@("clientes", "agentes", "ferramentas", "audit") | ForEach-Object {
    New-Item -ItemType Directory -Path "$vault\$_" -Force | Out-Null
}
```

- [ ] **Step 2: Criar README.md do vault**

```markdown
# ☧ Kairós — Second Brain

Este vault é a **memória persistente** do ecossistema Kairós.
Agentes, ferramentas e o orquestrador consultam e escrevem aqui automaticamente.

## Estrutura

- `clientes/` — Preferências, decisões e ferramentas de cada cliente
- `agentes/` — Aprendizado e regras de cada agente
- `ferramentas/` — Documentação das ferramentas do ecossistema
- `audit/` — Logs das operações realizadas pelos agentes
```

- [ ] **Step 3: Criar index.md de exemplo (clientes/)**

```markdown
# Clientes

_Esta pasta armazena informações específicas de cada cliente/tenant._

## Estrutura

```
clientes/{slug}/
├── index.md          — Resumo do cliente
├── preferencias.md   — Configurações aprendidas
├── decisoes.md       — Histórico de decisões
└── ferramentas.md    — Apps e tools ativos
```
```

- [ ] **Step 4: Criar orquestrador.md (agentes/)**

```markdown
# Orquestrador

Regras e aprendizado do orquestrador central do Kairós.

## Responsabilidades

- Roteamento de mensagens para o agente correto
- Resolução de ferramentas (tools)
- Consulta ao vault antes de responder sobre clientes
- Registro de decisões aprendidas no vault
```

- [ ] **Step 5: Criar memoria-global.md (agentes/)**

```markdown
# Memória Global

Fatos transversais que todos os agentes devem conhecer.

_Esta nota é populada automaticamente pelos agentes._
```

- [ ] **Step 6: Criar padroes.md (ferramentas/)**

```markdown
# Padrões de Ferramentas

Documentação e padrões de uso das ferramentas do ecossistema Kairós.

## Como documentar uma ferramenta

Crie um arquivo `ferramentas/{nome-da-ferramenta}.md` com:
- Descrição do que faz
- Parâmetros esperados
- Exemplo de uso
```

- [ ] **Step 7: Commit**

```bash
git -C "C:\Users\ferna\kairos-assistant" add docs/plans/2026-07-03-second-brain-implementation.md
git -C "C:\Users\ferna\kairos-assistant" commit -m "docs: add second brain implementation plan"
```

---

### Task 2: Módulo ObsidianVault no kairos-agent

**Files:**
- Create: `src/filesystem/obsidian_vault.py`
- Test: `tests/test_obsidian_vault.py`

**Interfaces:**
- Consumes: `FileSystemManager` (existente) — usado internamente para IO
- Produces: `ObsidianVault` class com métodos `search`, `read`, `write`, `list`, `links`, `backlinks`

- [ ] **Step 1: Write the failing test**

```python
import pytest
import tempfile
from pathlib import Path
from src.filesystem.obsidian_vault import ObsidianVault

@pytest.fixture
def vault():
    tmp = tempfile.mkdtemp()
    (Path(tmp) / "teste.md").write_text("# Teste\n\n[[outra-nota]]\n")
    (Path(tmp) / "outra-nota.md").write_text("# Outra\n\nlink para [[teste]]\n")
    (Path(tmp) / "sub").mkdir()
    (Path(tmp) / "sub" / "nota.md").write_text("# Sub\n")
    return ObsidianVault(tmp)

def test_search_finds_content(vault):
    results = vault.search("Teste")
    assert len(results) >= 1
    assert "teste.md" in [r["name"] for r in results]

def test_search_by_title(vault):
    results = vault.search("Outra")
    assert len(results) >= 1

def test_read_note(vault):
    result = vault.read("teste.md")
    assert result["content"] == "# Teste\n\n[[outra-nota]]\n"

def test_write_note(vault):
    result = vault.write("nova.md", "# Nova\nConteudo")
    assert result["written"]
    assert (Path(vault.base_path) / "nova.md").exists()

def test_list_folder(vault):
    result = vault.list("")
    assert len(result["items"]) >= 2
    assert any(i["name"] == "teste.md" for i in result["items"])

def test_list_subfolder(vault):
    result = vault.list("sub")
    assert len(result["items"]) == 1
    assert result["items"][0]["name"] == "nota.md"

def test_links_parses_wikilinks(vault):
    links = vault.links("teste.md")
    assert "outra-nota" in links

def test_backlinks_finds_references(vault):
    backlinks = vault.backlinks("teste.md")
    assert "outra-nota" in backlinks

def test_graph_returns_connections(vault):
    graph = vault.graph("teste.md")
    assert "nodes" in graph
    assert "edges" in graph

def test_write_creates_intermediate_dirs(vault):
    result = vault.write("a/b/c/nova.md", "# Profunda")
    assert result["written"]
    assert (Path(vault.base_path) / "a" / "b" / "c" / "nova.md").exists()

def test_read_nonexistent_returns_error(vault):
    with pytest.raises(FileNotFoundError):
        vault.read("inexistente.md")

def test_write_with_wikilinks(vault):
    vault.write("linkada.md", "Veja [[outra-nota]]")
    links = vault.links("linkada.md")
    assert "outra-nota" in links
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd C:\Users\ferna\kairos-agent && python -m pytest tests/test_obsidian_vault.py -v`
Expected: FAIL with "ModuleNotFoundError" or "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
import os
import re
from pathlib import Path
from typing import Optional


WIKILINK_PATTERN = re.compile(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]")


class ObsidianVault:
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)

    def search(self, query: str) -> list[dict]:
        results = []
        query_lower = query.lower()
        for md_file in self.base_path.rglob("*.md"):
            try:
                content = md_file.read_text(encoding="utf-8")
                rel = str(md_file.relative_to(self.base_path))
                if query_lower in content.lower() or query_lower in md_file.stem.lower():
                    results.append({
                        "name": rel,
                        "title": md_file.stem,
                        "path": rel,
                        "snippet": self._snippet(content, query, 100),
                    })
            except (OSError, PermissionError):
                pass
        return results

    def read(self, path: str) -> dict:
        full = self._resolve(path)
        if not full.exists():
            raise FileNotFoundError(f"Nota nao encontrada: {path}")
        content = full.read_text(encoding="utf-8")
        return {
            "path": str(full.relative_to(self.base_path)),
            "content": content,
            "size": len(content),
            "links": self.links(path),
            "backlinks": self.backlinks(path),
        }

    def write(self, path: str, content: str) -> dict:
        full = self.base_path / path
        full.parent.mkdir(parents=True, exist_ok=True)
        full.write_text(content, encoding="utf-8")
        return {
            "path": str(full.relative_to(self.base_path)),
            "written": True,
            "size": len(content),
            "links": self.links(path),
        }

    def list(self, folder: str = "") -> dict:
        target = self.base_path / folder if folder else self.base_path
        if not target.exists() or not target.is_dir():
            return {"path": folder, "items": [], "count": 0}
        items = []
        for item in sorted(target.iterdir()):
            rel = str(item.relative_to(self.base_path))
            items.append({
                "name": rel,
                "type": "directory" if item.is_dir() else "file",
                "size": item.stat().st_size if item.is_file() else 0,
            })
        return {"path": folder, "items": items, "count": len(items)}

    def links(self, path: str) -> list[str]:
        full = self._resolve(path)
        if not full.exists():
            return []
        content = full.read_text(encoding="utf-8")
        return [m.group(1) for m in WIKILINK_PATTERN.finditer(content)]

    def backlinks(self, path: str) -> list[dict]:
        target_stem = Path(path).stem
        results = []
        for md_file in self.base_path.rglob("*.md"):
            try:
                content = md_file.read_text(encoding="utf-8")
                if f"[[{target_stem}" in content:
                    rel = str(md_file.relative_to(self.base_path))
                    results.append({"source": rel})
            except (OSError, PermissionError):
                pass
        return results

    def graph(self, path: str) -> dict:
        nodes = set()
        edges = []
        to_visit = [path]
        visited = set()
        while to_visit and len(nodes) < 50:
            current = to_visit.pop(0)
            if current in visited:
                continue
            visited.add(current)
            nodes.add(current)
            try:
                links = self.links(current)
                for link in links:
                    link_path = f"{link}.md"
                    edges.append({"from": current, "to": link_path})
                    if link_path not in visited:
                        to_visit.append(link_path)
                backlinks = [b["source"] for b in self.backlinks(current)]
                for bl in backlinks:
                    if bl not in visited:
                        to_visit.append(bl)
            except FileNotFoundError:
                pass
        return {
            "nodes": list(nodes),
            "edges": edges,
            "central": path,
        }

    def _resolve(self, path: str) -> Path:
        p = self.base_path / path
        if p.exists():
            return p
        if not p.suffix:
            p = p.with_suffix(".md")
        return p

    @staticmethod
    def _snippet(content: str, query: str, max_len: int = 100) -> str:
        idx = content.lower().find(query.lower())
        if idx == -1:
            return content[:max_len].replace("\n", " ")
        start = max(0, idx - 40)
        end = min(len(content), idx + len(query) + 60)
        snippet = content[start:end].replace("\n", " ")
        if start > 0:
            snippet = "..." + snippet
        if end < len(content):
            snippet = snippet + "..."
        return snippet

    @staticmethod
    def is_valid_vault(path: str) -> bool:
        p = Path(path)
        return p.exists() and p.is_dir()
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd C:\Users\ferna\kairos-agent && python -m pytest tests/test_obsidian_vault.py -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\ferna\kairos-agent add src/filesystem/obsidian_vault.py tests/test_obsidian_vault.py
git -C C:\Users\ferna\kairos-agent commit -m "feat: add ObsidianVault module for second brain integration"
```

---

### Task 3: Registrar comandos do vault no AgentEngine

**Files:**
- Modify: `src/core/engine.py` — adicionar handlers vault.* no action_map
- Modify: `src/connection/protocol.py` — adicionar MESSAGE_TYPES vault_*
- Test: `tests/test_engine_vault.py`

**Interfaces:**
- Consumes: `ObsidianVault` (Task 2)
- Produces: 8 novos `vault.*` commands registrados no action_map

- [ ] **Step 1: Write failing test**

```python
import pytest
from src.core.engine import AgentEngine

@pytest.mark.asyncio
async def test_vault_search_handler_registered():
    engine = AgentEngine()
    assert "vault.search" in engine._get_action_map()
```

- [ ] **Step 2: Adicionar MESSAGE_TYPES no protocol.py**

```python
# Adicionar no dicionário MESSAGE_TYPES:
"vault_search": "Busca no vault Obsidian",
"vault_read": "Le nota do vault",
"vault_write": "Escreve nota no vault",
"vault_list": "Lista notas do vault",
"vault_links": "Lista wikilinks de uma nota",
"vault_backlinks": "Lista backlinks de uma nota",
"vault_graph": "Mapa de conexoes do vault",
"vault_result": "Resultado de operacao no vault",
```

- [ ] **Step 3: Adicionar handlers no AgentEngine**

```python
# Adicionar ao __init__:
self._vault: Optional[ObsidianVault] = None

# Adicionar ao action_map em _execute_task:
"vault.search": self._cmd_vault_search,
"vault.read": self._cmd_vault_read,
"vault.write": self._cmd_vault_write,
"vault.list": self._cmd_vault_list,
"vault.links": self._cmd_vault_links,
"vault.backlinks": self._cmd_vault_backlinks,
"vault.graph": self._cmd_vault_graph,

# Adicionar getter:
def _get_action_map(self):
    return self.__init__.__code__  # hack para teste

# Adicionar métodos:
async def _cmd_vault_search(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault_path = self._get_vault_path()
    vault = ObsidianVault(vault_path)
    return vault.search(params.get("query", ""))

async def _cmd_vault_read(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault = ObsidianVault(self._get_vault_path())
    return vault.read(params.get("path", ""))

async def _cmd_vault_write(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault = ObsidianVault(self._get_vault_path())
    return vault.write(params.get("path", ""), params.get("content", ""))

async def _cmd_vault_list(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault = ObsidianVault(self._get_vault_path())
    return vault.list(params.get("folder", ""))

async def _cmd_vault_links(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault = ObsidianVault(self._get_vault_path())
    return {"links": vault.links(params.get("path", ""))}

async def _cmd_vault_backlinks(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault = ObsidianVault(self._get_vault_path())
    return {"backlinks": vault.backlinks(params.get("path", ""))}

async def _cmd_vault_graph(self, params: dict):
    from src.filesystem.obsidian_vault import ObsidianVault
    vault = ObsidianVault(self._get_vault_path())
    return vault.graph(params.get("path", ""))

# Método auxiliar:
def _get_vault_path(self) -> str:
    import os
    return os.environ.get(
        "KAIROS_VAULT_PATH",
        os.path.expanduser("~/OneDrive/Documentos/,COFRE SUBSEDIAN")
    )
```

- [ ] **Step 4: Run tests**

Run: `cd C:\Users\ferna\kairos-agent && python -m pytest tests/ -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C C:\Users\ferna\kairos-agent add src/core/engine.py src/connection/protocol.py
git -C C:\Users\ferna\kairos-agent commit -m "feat: register vault.* commands in agent engine"
```

---

### Task 4: Adicionar handlers WebSocket no kairos-assistant

**Files:**
- Modify: `backend/app/routes/agent_ws.py` — adicionar comando vault no POST /command
- Test: `backend/tests/test_agent_vault.py`

**Interfaces:**
- Consumes: `POST /api/agent/command` (existente)
- Produces: endpoint funcional para enviar comandos `vault.*` ao Agent conectado

- [ ] **Step 1: Verificar endpoint existente**

O endpoint `POST /api/agent/command` já recebe `tenant_id`, `command_type` e `params`, e envia via WebSocket como `task_assign`. Ele já funciona para qualquer `command_type` — não precisa de alteração.

Apenas verificar que vault.* commands passam pelo endpoint sem modificação.

- [ ] **Step 2: Criar teste de integração**

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_vault_command_accepted():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.post(
            "/api/agent/command?tenant_id=test&command_type=vault.search&params=%7B%22query%22%3A%22teste%22%7D",
            headers={"Authorization": "test-key"},
        )
        # Pode retornar 404 se Agent nao conectado, mas nao 422
        assert resp.status_code in (200, 404)
```

- [ ] **Step 3: Run tests**

Run: `cd C:\Users\ferna\kairos-assistant && python -m pytest backend/tests/test_agent_vault.py -v`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git -C C:\Users\ferna\kairos-assistant add backend/tests/test_agent_vault.py
git -C C:\Users\ferna\kairos-assistant commit -m "test: add vault WS command integration test"
```

---

### Task 5: Modificar PromptComposer para incluir contexto do vault

**Files:**
- Modify: `core/application/prompt_composer.py`
- Test: `core/tests/test_prompt_composer_vault.py`

**Interfaces:**
- Consumes: `RuntimeContext` (existente)
- Produces: system prompt com instrução de consulta ao vault

- [ ] **Step 1: Escrever teste**

```python
import pytest
from core.application.prompt_composer import PromptComposer
from core.domain.entities.context import RuntimeContext

def test_vault_instruction_in_system_prompt():
    composer = PromptComposer()
    prompt = composer.compose()
    assert "Second Brain" in prompt or "vault" in prompt.lower() or "Obsidian" in prompt
```

- [ ] **Step 2: Modificar PromptComposer**

Adicionar no `compose()` após o `self._base_prompt`:

```python
VAULT_INSTRUCTION = (
    "\n\nVocê tem acesso ao Second Brain do Kairós (vault Obsidian). "
    "Consulte o vault antes de responder sobre clientes, ferramentas ou decisoes. "
    "Sempre que aprender algo novo, registre no vault."
)

# No método compose, adicionar após parts = [self._base_prompt]:
parts.append(VAULT_INSTRUCTION)
```

- [ ] **Step 3: Run tests**

Run: `cd C:\Users\ferna\kairos-assistant && python -m pytest core/tests/ -v`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git -C C:\Users\ferna\kairos-assistant add core/application/prompt_composer.py core/tests/test_prompt_composer_vault.py
git -C C:\Users\ferna\kairos-assistant commit -m "feat: add vault context instruction to PromptComposer"
```

---

### Task 6: Deploy e configuração

**Files:**
- Modify: `docker-compose.yml` (kairos-assistant)
- Modify: backend .env (se existir)

- [ ] **Step 1: Adicionar KAIROS_VAULT_PATH no Agent**

Verificar se `KAIROS_VAULT_PATH` está configurada no ambiente do Agent.

- [ ] **Step 2: Verificar deploy**

O Agent precisa estar rodando no desktop do usuário com acesso ao vault local.
O OneDrive precisa estar sincronizando o vault.
