"""Documents Agent — Upload, busca e processamento de documentos."""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent


class DocumentsAgent(BaseAgent):
    name = "documents"
    description = "Especialista em documentos — upload, extração de texto e análise"

    async def can_handle(self, message: str, context: Optional[dict] = None) -> float:
        msg = message.lower()
        keywords = [
            "documento", "pdf", "docx", "arquivo", "upload",
            "extrair texto", "analisar documento", "ler arquivo",
            "imagem", "foto", "anexo",
        ]
        score = sum(0.15 for kw in keywords if kw in msg)
        if any(w in msg for w in ["processar", "abrir", "mostrar"]):
            score += 0.1
        return min(score, 1.0)

    async def handle(self, message: str, session_id: str, db: AsyncSession, context: Optional[dict] = None) -> dict:
        msg = message.lower()

        if any(w in msg for w in ["como", "o que"]):
            return {
                "response": (
                    "Você pode enviar documentos (PDF, DOCX, imagens) para o assistente.\n\n"
                    "Basta anexar o arquivo no chat ou falar 'processar este documento'.\n\n"
                    "O sistema extrai texto automaticamente e pode analisar o conteúdo."
                ),
                "agent": "documents", "session_id": session_id, "action": "guide",
            }

        return {
            "response": (
                "Para processar um documento, envie o arquivo pelo chat.\n"
                "Posso extrair texto de PDFs, DOCX, imagens e analisar o conteúdo."
            ),
            "agent": "documents", "session_id": session_id, "action": "help",
        }
