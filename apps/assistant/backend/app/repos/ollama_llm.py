from typing import Optional, AsyncGenerator
from core.domain.interfaces.llm_port import LLMPort
import json
import httpx
import os


class OllamaLLM(LLMPort):
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = base_url or os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self._model = model or os.getenv("OLLAMA_MODEL", "llama3.2:3b")

    async def chat(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        tools: Optional[list[dict]] = None,
    ) -> dict:
        body = {"model": model or self._model, "messages": messages, "stream": False}
        async with httpx.AsyncClient(timeout=300) as client:
            resp = await client.post(
                f"{self.base_url}/api/chat",
                json=body,
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "choices": [
                    {
                        "message": {
                            "role": "assistant",
                            "content": data.get("message", {}).get("content", ""),
                        }
                    }
                ]
            }

    async def chat_stream(
        self,
        messages: list[dict],
        model: Optional[str] = None,
        tools: Optional[list[dict]] = None,
    ) -> AsyncGenerator[str, None]:
        body = {"model": model or self._model, "messages": messages, "stream": True}
        async with httpx.AsyncClient(timeout=300) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=body,
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    try:
                        data = json.loads(line)
                        content = data.get("message", {}).get("content", "")
                        if content:
                            yield content
                    except json.JSONDecodeError:
                        continue
