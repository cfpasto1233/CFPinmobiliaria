import uuid
from typing import Annotated

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.api.deps import SessionDep, SuperUser
from app.crud.solicitud_documento_propietario import (
    create_solicitud_documento_propietario,
    get_solicitud_documento_by_id,
    get_solicitud_documento_by_token,
    list_solicitudes_documentos_propietario,
    validar_y_generar_token,
)
from app.schemas.solicitud_documento_propietario import (
    PlanContratado,
    SolicitudDocumentoPropietarioDetalle,
    SolicitudDocumentoPropietarioForm,
    SolicitudDocumentoPropietarioPublic,
    SolicitudDocumentoTokenCheck,
    SolicitudesDocumentosPropietarioPublic,
)
from app.services import storage

router = APIRouter(
    prefix="/solicitudes-documentos-propietario", tags=["solicitudes-documentos-propietario"]
)


@router.post("/", response_model=SolicitudDocumentoPropietarioPublic)
def create_solicitud_documento_propietario_endpoint(
    session: SessionDep,
    nombre_completo: Annotated[str, Form(max_length=255)],
    numero_contacto: Annotated[str, Form(max_length=20)],
    plan_contratado: Annotated[PlanContratado, Form()],
    cedula: Annotated[UploadFile, File()],
    certificado_libertad: Annotated[UploadFile, File()],
    escritura: Annotated[UploadFile, File()],
    comprobante_pago: Annotated[UploadFile, File()],
    poder: Annotated[UploadFile | None, File()] = None,
) -> SolicitudDocumentoPropietarioPublic:
    form = SolicitudDocumentoPropietarioForm(
        nombre_completo=nombre_completo,
        numero_contacto=numero_contacto,
        plan_contratado=plan_contratado,
    )

    for archivo in (cedula, certificado_libertad, escritura, comprobante_pago):
        storage.validate_document(archivo)
    poder_key: str | None = None
    if poder is not None and poder.filename:
        storage.validate_document(poder)
        poder_key = storage.upload_document(poder, folder="documentos-propietario")

    cedula_key = storage.upload_document(cedula, folder="documentos-propietario")
    certificado_libertad_key = storage.upload_document(
        certificado_libertad, folder="documentos-propietario"
    )
    escritura_key = storage.upload_document(escritura, folder="documentos-propietario")
    comprobante_pago_key = storage.upload_document(comprobante_pago, folder="documentos-propietario")

    return create_solicitud_documento_propietario(
        session=session,
        form=form,
        cedula_key=cedula_key,
        certificado_libertad_key=certificado_libertad_key,
        escritura_key=escritura_key,
        poder_key=poder_key,
        comprobante_pago_key=comprobante_pago_key,
    )


@router.get("/", response_model=SolicitudesDocumentosPropietarioPublic)
def read_solicitudes_documentos_propietario(
    session: SessionDep,
    _: SuperUser,
    skip: int = 0,
    limit: int = 100,
) -> SolicitudesDocumentosPropietarioPublic:
    items, count = list_solicitudes_documentos_propietario(session=session, skip=skip, limit=limit)
    return SolicitudesDocumentosPropietarioPublic(data=list(items), count=count)


@router.get("/{solicitud_id}", response_model=SolicitudDocumentoPropietarioDetalle)
def read_solicitud_documento_propietario(
    solicitud_id: uuid.UUID, session: SessionDep, _: SuperUser
) -> SolicitudDocumentoPropietarioDetalle:
    solicitud = get_solicitud_documento_by_id(session=session, solicitud_id=solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")
    return SolicitudDocumentoPropietarioDetalle(
        **SolicitudDocumentoPropietarioPublic.model_validate(solicitud).model_dump(),
        cedula_url=storage.presigned_url(solicitud.cedula_key, expires_in=3600),
        certificado_libertad_url=storage.presigned_url(
            solicitud.certificado_libertad_key, expires_in=3600
        ),
        escritura_url=storage.presigned_url(solicitud.escritura_key, expires_in=3600),
        poder_url=storage.presigned_url(solicitud.poder_key, expires_in=3600)
        if solicitud.poder_key
        else None,
        comprobante_pago_url=storage.presigned_url(solicitud.comprobante_pago_key, expires_in=3600),
    )


@router.post("/{solicitud_id}/validar", response_model=SolicitudDocumentoPropietarioPublic)
def validar_solicitud_documento_propietario_endpoint(
    solicitud_id: uuid.UUID, session: SessionDep, _: SuperUser
) -> SolicitudDocumentoPropietarioPublic:
    solicitud = get_solicitud_documento_by_id(session=session, solicitud_id=solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada.")
    return validar_y_generar_token(session=session, db_obj=solicitud)


@router.get("/token/{token}", response_model=SolicitudDocumentoTokenCheck)
def check_token_endpoint(token: str, session: SessionDep) -> SolicitudDocumentoTokenCheck:
    solicitud = get_solicitud_documento_by_token(session=session, token=token)
    if not solicitud:
        return SolicitudDocumentoTokenCheck(
            valido=False, motivo="Este link no es válido, ya expiró o ya fue utilizado."
        )
    return SolicitudDocumentoTokenCheck(valido=True, plan_contratado=solicitud.plan_contratado)
