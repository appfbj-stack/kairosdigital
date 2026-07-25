"""Agent Router — Detecta intenção e roteia para o agente correto."""

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.agents.church.church_agent import AionChurchAgent
from app.agents.guide.guide_agent import GuideAgent
from app.agents.vault.vault_agent import VaultAgent
from app.agents.documents.documents_agent import DocumentsAgent
from app.agents.tools.tools_agent import ToolsAgent

logger = logging.getLogger(__name__)


class AgentRouter:
    def __init__(self):
        self.agents: list[BaseAgent] = [
            AionChurchAgent(),
            GuideAgent(),
            VaultAgent(),
            DocumentsAgent(),
            ToolsAgent(),
        ]

    async def route(self, message: str, session_id: str, db: AsyncSession,
                    context: Optional[dict] = None) -> dict:
        scores = []
        for agent in self.agents:
            try:
                score = await agent.can_handle(message, context)
                if score > 0:
                    scores.append((agent, score))
            except Exception as e:
                logger.warning("Agent %s can_handle error: %s", agent.name, e)

        scores.sort(key=lambda x: x[1], reverse=True)

        if scores and scores[0][1] >= 0.4:
            best = scores[0][0]
            logger.info("Routing to %s (score=%.2f)", best.name, scores[0][1])
            try:
                result = await best.handle(message, session_id, db, context)
                result["routed_to"] = best.name
                result["confidence"] = scores[0][1]
                return result
            except Exception as e:
                logger.exception("Agent %s handle error: %s", best.name, e)
                return {
                    "response": f"Erro ao processar com agente {best.name}: {str(e)}",
                    "agent": "error", "session_id": session_id, "routed_to": best.name,
                }

        return {
            "response": (
                "Não entendi exatamente o que você quer fazer.\n\n"
                "Você pode pedir:\n"
                "- Cadastrar/buscar/listar membros\n"
                "- Criar/buscar notas\n"
                - "Ajuda sobre o app\n"
                - "Listar ferramentas\n"
                "- Processar documentos\n\n"
                "Como posso ajudar?"
            ),
            "agent": "router", "session_id": session_id, "action": "fallback",
        }

    def list_agents(self) -> list[dict]:
        return [
            {"name": a.name, "description": a.description}
            for a in self.agents
        ]
