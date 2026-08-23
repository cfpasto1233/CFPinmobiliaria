import uuid
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import EmailStr

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_trabajo import (
    create_solicitud_trabajo,
    get_solicitud_trabajo_by_id,
    list_solicitudes_trabajo,
)
from app.schemas.solicitud_trabajo import (
    SolicitudesTrabajoPublic,
    SolicitudTrabajoDetalle,
    SolicitudTrabajoForm,
    SolicitudTrabajoPublic,
)
from app.services import storage

router = APIRouter(prefix="/solicitudes-trabajo", tags=["solicitudes-trabajo"])


@router.post("/", response_model=SolicitudTrabajoPublic)
def create_solicitud_trabajo_endpoint(
    session: SessionDep,
    nombre: Annotated[str, Form(max_length=255)],
    correo: Annotated[EmailStr, Form()],
    numero_contacto: Annotated[str, Form(max_length=20)],
    hoja_de_vida: Annotated[UploadFile, File()],
) -> SolicitudTrabajoPublic:
    form = SolicitudTrabajoForm(nombre=nombre, correo=correo, numero_contacto=numero_contacto)

    storage.validate_document(hoja_de_vida)
    hoja_de_vida_key = storage.upload_document(hoja_de_vida, folder="trabaja-con-nosotros")

    return create_solicitud_trabajo(session=session, form=form, hoja_de_vida_key=hoja_de_vida_key)


@router.get("/", response_model=SolicitudesTrabajoPublic)
def read_solicitudes_trabajo(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesTrabajoPublic:
    items, count = list_solicitudes_trabajo(session=session, skip=skip, limit=limit)
    return SolicitudesTrabajoPublic(data=list(items), count=count)


@router.get("/{solicitud_id}", response_model=SolicitudTrabajoDetalle)
def read_solicitud_trabajo(
    solicitud_id: uuid.UUID, session: SessionDep, _: SuperUser
) -> SolicitudTrabajoDetalle:
    solicitud = get_solicitud_trabajo_by_id(session=session, solicitud_id=solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")
    return SolicitudTrabajoDetalle(
        **SolicitudTrabajoPublic.model_validate(solicitud).model_dump(),
        hoja_de_vida_url=storage.presigned_url(solicitud.hoja_de_vida_key, expires_in=3600),
    )
