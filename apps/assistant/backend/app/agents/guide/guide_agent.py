"""Guide Agent — Sabe tudo sobre o app e ensina o pastor a usar."""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.agents.base import BaseAgent
from app.agents.manifest import APP_MANIFEST


class GuideAgent(BaseAgent):
    name = "guide"
    description = "Especialista em conhecer todas as funcionalidades do app e ensinar o pastor a usar"

    GUIDE_PROMPT = """Você é o Guide Agent do app Igreja Sede.
    Você conhece TODAS as funcionalidades do app e ensina o pastor a usar cada uma.
    Seja amigável e didático. Use linguagem simples.

    MANIFESTO DO APP (conhecimento completo):
    {manifest}

    REGRAS:
    1. Se o usuário perguntar "como faz X", explique o passo a passo
    2. Se perguntar "o que é X", explique a funcionalidade
    3. Se perguntar sobre agentes, explique cada um
    4. Se não souber, seja honesto e sugira onde encontrar a info
    5. Sempre dê exemplos práticos
    6. Responda EM PORTUGUÊS
    """

    async def can_handle(self, message: str, context: Optional[dict] = None) -> float:
        msg = message.lower()
        keywords = [
            "como funciona", "como faz", "como usar", "o que é", "me ajuda",
            "o que esse app faz", "para que serve", "como cadastra",
            "como criar", "como buscar", "onde vejo", "me explique",
            "quais agentes", "quais funcionalidades", "tutorial",
            "ajuda", "help", "o app faz", "consegue fazer",
        ]
        score = 0
        for kw in keywords:
            if kw in msg:
                score += 0.2
        if any(f["id"] in msg for f in APP_MANIFEST["features"]):
            score += 0.3
        return min(score, 1.0)

    async def handle(self, message: str, session_id: str, db: AsyncSession, context: Optional[dict] = None) -> dict:
        from app.config import settings
        from app.services.llm import LLMService

        llm = LLMService(api_key=settings.openrouter_api_key)
        manifest_str = self._format_manifest(message)

        response = await llm.chat(
            history=[],
            prompt=message,
            context=self.GUIDE_PROMPT.format(manifest=manifest_str),
        )
        content = ""
        try:
            content = response["choices"][0]["message"]["content"]
        except (KeyError, IndexError):
            content = "Desculpe, não consegui processar sua pergunta agora."

        matched = self._find_matched_feature(message)
        return {
            "response": content,
            "agent": "guide",
            "session_id": session_id,
            "feature": matched,
            "action": "guide",
        }

    def _format_manifest(self, message: str) -> str:
        lines = []
        for f in APP_MANIFEST["features"]:
            lines.append(f"- {f['name']}: {f['description']}")
            if any(kw in message.lower() for kw in ["como", "exemplo", "mostra"]):
                lines.extend(f"  → {e}" for e in f.get("examples", []))
        if "workflow" in message.lower() or "passo" in message.lower():
            lines.append("\nFLUXOS:")
            for w in APP_MANIFEST.get("workflows", []):
                lines.append(f"\n{w['name']}:")
                lines.extend(f"  {i+1}. {s}" for i, s in enumerate(w["steps"]))
        return "\n".join(lines)

    def _find_matched_feature(self, message: str) -> Optional[str]:
        msg = message.lower()
        for f in APP_MANIFEST["features"]:
            if f["id"] in msg or f["name"].lower() in msg:
                return f["id"]
            for kw in f.get("examples", []):
                if any(word in msg for word in kw.lower().split()):
                    return f["id"]
        return None
