from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.note import Note


async def search_notes(db: AsyncSession, tenant_id: str, q: str, folder: str | None = None):
    stmt = select(Note).where(
        Note.tenant_id == tenant_id,
        Note.is_archived == False,
        or_(
            Note.title.ilike(f"%{q}%"),
            Note.content.ilike(f"%{q}%"),
        ),
    )
    if folder:
        stmt = stmt.where(Note.folder == folder)
    stmt = stmt.order_by(Note.updated_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def list_notes(
    db: AsyncSession, tenant_id: str, folder: str | None = None, include_archived: bool = False
):
    stmt = select(Note).where(Note.tenant_id == tenant_id)
    if not include_archived:
        stmt = stmt.where(Note.is_archived == False)
    if folder is not None:
        stmt = stmt.where(Note.folder == folder)
    stmt = stmt.order_by(Note.updated_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_note(db: AsyncSession, tenant_id: str, note_id: str):
    stmt = select(Note).where(Note.id == note_id, Note.tenant_id == tenant_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_note(db: AsyncSession, tenant_id: str, data: dict):
    note = Note(tenant_id=tenant_id, **data)
    db.add(note)
    await db.commit()
    await db.refresh(note)
    return note


async def update_note(db: AsyncSession, tenant_id: str, note_id: str, data: dict):
    note = await get_note(db, tenant_id, note_id)
    if not note:
        return None
    for key, value in data.items():
        setattr(note, key, value)
    await db.commit()
    await db.refresh(note)
    return note


async def delete_note(db: AsyncSession, tenant_id: str, note_id: str):
    note = await get_note(db, tenant_id, note_id)
    if not note:
        return False
    await db.delete(note)
    await db.commit()
    return True


async def get_folders(db: AsyncSession, tenant_id: str):
    stmt = (
        select(Note.folder)
        .where(Note.tenant_id == tenant_id, Note.folder.isnot(None))
        .distinct()
    )
    result = await db.execute(stmt)
    return [row[0] for row in result if row[0]]


async def get_backlinks(db: AsyncSession, tenant_id: str, note_id: str):
    note = await get_note(db, tenant_id, note_id)
    if not note:
        return []
    title_lower = note.title.lower()
    stmt = select(Note).where(
        Note.tenant_id == tenant_id,
        Note.content.ilike(f"%[[{title_lower}]]%"),
        Note.id != note_id,
    )
    result = await db.execute(stmt)
    return result.scalars().all()


def note_to_dict(note: Note) -> dict:
    return {
        "id": note.id,
        "tenant_id": note.tenant_id,
        "title": note.title,
        "content": note.content,
        "file_path": note.file_path,
        "tags": note.tags or [],
        "links": note.links or [],
        "is_pinned": note.is_pinned,
        "is_archived": note.is_archived,
        "folder": note.folder,
        "source": note.source,
        "created_at": str(note.created_at),
        "updated_at": str(note.updated_at),
    }
