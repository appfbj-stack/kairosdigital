from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession


class BaseAgent(ABC):
    name: str = ""
    description: str = ""

    @abstractmethod
    async def can_handle(self, message: str, context: Optional[dict] = None) -> float:
        pass

    @abstractmethod
    async def handle(self, message: str, session_id: str, db: AsyncSession, context: Optional[dict] = None) -> dict:
        pass
