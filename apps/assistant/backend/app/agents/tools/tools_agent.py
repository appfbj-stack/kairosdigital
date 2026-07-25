"""Tools Agent — Descoberta e execução de ferramentas do ecossistema."""

from typing import Optional, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from sqlalchemy import select


class ToolsAgent(BaseAgent):
    name = "tools"
    description = "Especialista em ferramentas — descobre e executa ferramentas registradas"

    async def can_handle(self, message: str, context: Optional[dict] = None) -> float:
        msg = message.lower()
        keywords = [
            "ferramenta", "tool", "ferramentas disponíveis",
            "quais ferramentas", "executar", "registrar ferramenta",
            "o que as ferramentas fazem",
        ]
        score = sum(0.2 for kw in keywords if kw in msg)
        return min(score, 1.0)

    async def handle(self, message: str, session_id: str, db: AsyncSession, context: Optional[dict] = None) -> dict:
        msg = message.lower()
        tenant_id = context.get("tenant_id", "default") if context else "default"

        if any(w in msg for w in ["quais", "lista", "disponíveis", "tem"]):
            return await self._list_tools(db, session_id, tenant_id)

        if any(w in msg for w in ["como", "o que é", "explica"]):
            return await self._explain_tools(db, session_id, message, tenant_id)

        return await self._list_tools(db, session_id, tenant_id)

    async def _list_tools(self, db: AsyncSession, session_id: str, tenant_id: str) -> dict:
        try:
            from app.models import Tool, App
            result = await db.execute(
                select(Tool).where(Tool.is_active == True)
            )
            tools = result.scalars().all()
        except Exception:
            tools = []

        if not tools:
            return {
                "response": "Nenhuma ferramenta registrada no momento.",
                "agent": "tools", "session_id": session_id, "action": "list_empty",
            }

        lines = [f"- {t.name}: {t.description or 'Sem descrição'}" for t in tools[:20]]
        return {
            "response": f"Ferramentas disponíveis ({len(tools)}):\n\n" + "\n".join(lines),
            "agent": "tools", "session_id": session_id, "action": "list",
            "tools": [{"id": t.id, "name": t.name} for t in tools],
        }

    async def _explain_tools(self, db: AsyncSession, session_id: str, message: str, tenant_id: str) -> dict:
        try:
            from app.models import Tool, App
            result = await db.execute(
                select(Tool).where(Tool.is_active == True)
            )
            tools = result.scalars().all()
        except Exception:
            tools = []

        if not tools:
            return {
                "response": "Nenhuma ferramenta registrada.",
                "agent": "tools", "session_id": session_id, "action": "list_empty",
            }

        lines = []
        for t in tools[:10]:
            lines.append(f"**{t.name}**")
            if t.description:
                lines.append(f"  {t.description}")
            lines.append(f"  Endpoint: {t.method} {t.endpoint}")
            lines.append("")

        return {
            "response": "\n".join(lines) or "Nenhuma ferramenta encontrada.",
            "agent": "tools", "session_id": session_id, "action": "explain",
        }
