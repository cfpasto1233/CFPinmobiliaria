import uuid
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from app.api.deps import SessionDep, SuperUser
from app.crud.reporte_dano import create_reporte_dano, get_reporte_dano_by_id, list_reportes_dano
from app.schemas.reporte_dano import (
    MedioComunicacionReporte,
    ReporteDanoForm,
    ReporteDanoFotosPublic,
    ReporteDanoPublic,
    ReportesDanoPublic,
    TipoReporteDano,
)
from app.services import storage

router = APIRouter(prefix="/reportes-dano", tags=["reportes-dano"])

MAX_FOTOS = 5


def _mensaje_error_validacion(exc: ValidationError) -> str:
    return " ".join(error["msg"].removeprefix("Value error, ") for error in exc.errors())


@router.post("/", response_model=ReporteDanoPublic)
def create_reporte_dano_endpoint(
    session: SessionDep,
    id: Annotated[uuid.UUID, Form()],
    nombre_completo: Annotated[str, Form(max_length=255)],
    numero_contacto: Annotated[str, Form(max_length=20)],
    tipo_reporte: Annotated[TipoReporteDano, Form()],
    descripcion_dano: Annotated[str, Form(max_length=1000)],
    medio_comunicacion: Annotated[MedioComunicacionReporte | None, Form()] = None,
    tipo_reporte_otro: Annotated[str | None, Form(max_length=100)] = None,
    fotos: Annotated[list[UploadFile], File()] = [],  # noqa: B006
) -> ReporteDanoPublic:
    # El id lo genera el frontend (crypto.randomUUID()) y lo manda desde el submit, ANTES de que
    # exista este registro — así el mensaje de WhatsApp puede incluir el link a
    # /reportes/{id}/fotos y abrirse de inmediato, sin esperar esta respuesta. Colisión de UUID
    # es prácticamente imposible, pero se maneja igual como 409 en vez de un 500 genérico.
    if len(fotos) > MAX_FOTOS:
        raise HTTPException(status_code=422, detail=f"Máximo {MAX_FOTOS} fotos.")

    try:
        form = ReporteDanoForm(
            nombre_completo=nombre_completo,
            medio_comunicacion=medio_comunicacion,
            numero_contacto=numero_contacto,
            tipo_reporte=tipo_reporte,
            tipo_reporte_otro=tipo_reporte_otro,
            descripcion_dano=descripcion_dano,
        )
    except ValidationError as exc:
        raise HTTPException(status_code=422, detail=_mensaje_error_validacion(exc)) from exc

    keys: list[str] = []
    for foto in fotos:
        if not foto.filename:
            continue
        storage.validate_image(foto)
        keys.append(storage.upload_image(foto, folder="reportes-dano"))

    try:
        return create_reporte_dano(session=session, id=id, form=form, fotos=keys)
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(status_code=409, detail="Ya existe un reporte con ese id.") from exc


@router.get("/", response_model=ReportesDanoPublic)
def read_reportes_dano(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> ReportesDanoPublic:
    items, count = list_reportes_dano(session=session, skip=skip, limit=limit)
    return ReportesDanoPublic(data=list(items), count=count)


@router.get("/{reporte_id}/fotos", response_model=ReporteDanoFotosPublic)
def read_reporte_dano_fotos(reporte_id: uuid.UUID, session: SessionDep) -> ReporteDanoFotosPublic:
    reporte = get_reporte_dano_by_id(session=session, reporte_id=reporte_id)
    if not reporte:
        raise HTTPException(status_code=404, detail="Reporte no encontrado.")
    return ReporteDanoFotosPublic(
        fotos=[storage.presigned_url(key, expires_in=86400) for key in reporte.fotos]
    )
