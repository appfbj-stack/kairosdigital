import re
import hashlib
import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.note import Note
from app.services.vault_service import note_to_dict

logger = logging.getLogger(__name__)

WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
TAG_RE = re.compile(r"(?<!\w)#(\w[\w-]*)")


def extract_wikilinks(content: str) -> list[str]:
    return list(set(WIKILINK_RE.findall(content)))


def extract_tags(content: str) -> list[str]:
    return list(set(TAG_RE.findall(content)))


def compute_checksum(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


class KnowledgeIndexer:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def index_note(self, note: Note) -> Note:
        links = extract_wikilinks(note.content)
        tags = extract_tags(note.content)
        checksum = compute_checksum(note.content)

        changed = False
        if set(note.links or []) != set(links):
            note.links = links
            changed = True
        if set(note.tags or []) != set(tags):
            note.tags = tags
            changed = True
        if note.checksum != checksum:
            note.checksum = checksum
            changed = True

        if changed:
            self.db.add(note)
            await self.db.commit()
            logger.info("Indexed note %s (%d links, %d tags)", note.id, len(links), len(tags))

        return note

    async def index_all_notes(self) -> dict:
        result = await self.db.execute(
            select(Note).where(Note.is_archived == False)
        )
        notes = result.scalars().all()
        indexed = 0
        for note in notes:
            try:
                await self.index_note(note)
                indexed += 1
            except Exception as e:
                logger.exception("Failed to index note %s: %s", note.id, e)
        return {"total": len(notes), "indexed": indexed}
