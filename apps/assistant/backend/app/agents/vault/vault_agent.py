"""Vault Agent — Notas, conhecimento e grafo do Second Brain."""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from app.services.vault_service import (
    search_notes, list_notes, get_note, create_note, get_folders, note_to_dict,
)


class VaultAgent(BaseAgent):
    name = "vault"
    description = "Especialista em notas e conhecimento — cria, busca e conecta notas no vault"

    async def can_handle(self, message: str, context: Optional[dict] = None) -> float:
        msg = message.lower()
        keywords = [
            "nota", "vault", "anotação", "anotar", "registrar",
            "segundo cérebro", "second brain", "memória",
            "arquivar", "wikilink", "backlink", "grafo",
            "guardar", "salvar informação", "lembrar",
        ]
        score = sum(0.15 for kw in keywords if kw in msg)
        return min(score, 1.0)

    async def handle(self, message: str, session_id: str, db: AsyncSession, context: Optional[dict] = None) -> dict:
        msg = message.lower()
        tenant_id = "default"

        if any(w in msg for w in ["criar", "nova nota", "anotar", "registrar", "salvar"]):
            return await self._handle_create(message, session_id, db, tenant_id)

        if any(w in msg for w in ["buscar", "procurar", "encontrar", "acha"]):
            return await self._handle_search(message, session_id, db, tenant_id)

        if any(w in msg for w in ["pasta", "folder", "listar"]):
            folders = await get_folders(db, tenant_id)
            return {
                "response": f"Pastas disponíveis: {', '.join(folders) if folders else 'Nenhuma pasta encontrada.'}",
                "agent": "vault", "session_id": session_id, "action": "list_folders",
            }

        notes = await list_notes(db, tenant_id)
        count = len(notes)
        return {
            "response": f"Você tem {count} nota(s) no vault.\n\nDiga 'criar nota' para adicionar ou 'buscar' para encontrar.",
            "agent": "vault", "session_id": session_id, "action": "list",
        }

    async def _handle_create(self, message: str, session_id: str, db: AsyncSession, tenant_id: str) -> dict:
        parts = message.split("nota", 1)
        title = "Nota sem título"
        if len(parts) > 1 and parts[1].strip():
            title = parts[1].strip().split(",")[0].strip()[:200]
        data = {"title": title, "content": message, "source": "agent"}
        note = await create_note(db, tenant_id, data)
        return {
            "response": f"Nota criada com sucesso!\n\nTítulo: {title}\nID: {note.id}",
            "agent": "vault", "session_id": session_id, "action": "created", "note_id": note.id,
        }

    async def _handle_search(self, message: str, session_id: str, db: AsyncSession, tenant_id: str) -> dict:
        import re
        match = re.search(r'(?:buscar|procurar|encontrar)\s+(.+)', message.lower())
        query = match.group(1).strip() if match else message
        notes = await search_notes(db, tenant_id, query)
        if not notes:
            return {
                "response": f"Nenhuma nota encontrada para '{query}'.",
                "agent": "vault", "session_id": session_id, "action": "search_empty",
            }
        lines = [f"- {n.title}" for n in notes[:10]]
        return {
            "response": f"Encontrei {len(notes)} nota(s):\n\n" + "\n".join(lines),
            "agent": "vault", "session_id": session_id, "action": "search",
        }
