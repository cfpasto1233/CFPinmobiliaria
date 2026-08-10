import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.api.deps import SessionDep, SuperUser
from app.crud.evento import (
    create_evento,
    delete_evento,
    get_evento_by_id,
    list_eventos,
    replace_foto,
    update_evento,
)
from app.schemas.evento import EventoForm, EventoPublic, EventosPublic, EventoUpdate
from app.services import storage

router = APIRouter(prefix="/eventos", tags=["eventos"])


@router.get("/", response_model=EventosPublic)
def read_eventos(session: SessionDep, skip: int = 0, limit: int = 100) -> EventosPublic:
    items, count = list_eventos(session=session, skip=skip, limit=limit)
    return EventosPublic(data=list(items), count=count)


@router.get("/{evento_id}", response_model=EventoPublic)
def read_evento_by_id(evento_id: uuid.UUID, session: SessionDep) -> EventoPublic:
    evento = get_evento_by_id(session=session, evento_id=evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    return evento


@router.post("/", response_model=EventoPublic)
def create_evento_endpoint(
    session: SessionDep,
    _: SuperUser,
    nombre: Annotated[str, Form(min_length=1, max_length=255)],
    descripcion: Annotated[str, Form(min_length=1)],
    fecha: Annotated[date, Form()],
    foto: Annotated[UploadFile, File()],
) -> EventoPublic:
    form = EventoForm(nombre=nombre, descripcion=descripcion, fecha=fecha)
    storage.validate_image(foto)
    key = storage.upload_image(foto, folder="eventos")
    return create_evento(session=session, form=form, foto_key=key)


@router.patch("/{evento_id}", response_model=EventoPublic)
def update_evento_endpoint(
    evento_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    evento_in: EventoUpdate,
) -> EventoPublic:
    evento = get_evento_by_id(session=session, evento_id=evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    return update_evento(session=session, db_obj=evento, obj_in=evento_in)


@router.delete("/{evento_id}")
def delete_evento_endpoint(
    evento_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
) -> dict[str, str]:
    evento = get_evento_by_id(session=session, evento_id=evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    key = delete_evento(session=session, db_obj=evento)
    storage.delete_object(key)
    return {"message": "Evento deleted"}


@router.post("/{evento_id}/foto", response_model=EventoPublic)
def replace_foto_endpoint(
    evento_id: uuid.UUID,
    session: SessionDep,
    _: SuperUser,
    file: Annotated[UploadFile, File()],
) -> EventoPublic:
    evento = get_evento_by_id(session=session, evento_id=evento_id)
    if not evento:
        raise HTTPException(status_code=404, detail="Evento no encontrado.")
    storage.validate_image(file)
    key = storage.upload_image(file, folder="eventos")
    old_key = replace_foto(session=session, evento=evento, key=key)
    storage.delete_object(old_key)
    return evento
