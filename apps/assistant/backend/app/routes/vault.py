from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.vault_service import (
    search_notes, list_notes, get_note, create_note,
    update_note, delete_note, get_folders, get_backlinks,
    note_to_dict,
)

router = APIRouter(prefix="/api/vault", tags=["vault"])


def _tenant_id():
    return "default"


class NoteCreate(BaseModel):
    title: str
    content: str = ""
    file_path: str | None = None
    tags: list[str] | None = None
    links: list[str] | None = None
    is_pinned: bool = False
    folder: str | None = None
    source: str = "api"


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    file_path: str | None = None
    tags: list[str] | None = None
    links: list[str] | None = None
    is_pinned: bool | None = None
    is_archived: bool | None = None
    folder: str | None = None


@router.get("/search")
async def buscar_notas(
    q: str = Query(..., min_length=1),
    folder: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    notes = await search_notes(db, _tenant_id(), q, folder)
    return {"notes": [note_to_dict(n) for n in notes], "total": len(notes)}


@router.get("/")
async def listar_notas(
    folder: str | None = Query(None),
    include_archived: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    notes = await list_notes(db, _tenant_id(), folder, include_archived)
    return {"notes": [note_to_dict(n) for n in notes], "total": len(notes)}


@router.get("/folders")
async def listar_pastas(db: AsyncSession = Depends(get_db)):
    folders = await get_folders(db, _tenant_id())
    return {"folders": folders}


@router.get("/{note_id}")
async def obter_nota(note_id: str, db: AsyncSession = Depends(get_db)):
    note = await get_note(db, _tenant_id(), note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Nota nao encontrada")
    backlinks = await get_backlinks(db, _tenant_id(), note_id)
    result = note_to_dict(note)
    result["backlinks"] = [{"id": b.id, "title": b.title} for b in backlinks]
    return {"note": result}


@router.post("/", status_code=201)
async def criar_nota(body: NoteCreate, db: AsyncSession = Depends(get_db)):
    data = body.model_dump(exclude_none=True)
    note = await create_note(db, _tenant_id(), data)
    return {"success": True, "note": note_to_dict(note)}


@router.put("/{note_id}")
async def atualizar_nota(note_id: str, body: NoteUpdate, db: AsyncSession = Depends(get_db)):
    data = body.model_dump(exclude_none=True)
    note = await update_note(db, _tenant_id(), note_id, data)
    if not note:
        raise HTTPException(status_code=404, detail="Nota nao encontrada")
    return {"success": True, "note": note_to_dict(note)}


@router.delete("/{note_id}")
async def remover_nota(note_id: str, db: AsyncSession = Depends(get_db)):
    ok = await delete_note(db, _tenant_id(), note_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Nota nao encontrada")
    return {"success": True, "message": "Nota removida com sucesso"}
