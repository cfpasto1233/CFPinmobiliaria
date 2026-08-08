import secrets
import uuid
from datetime import timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.solicitud_documento_propietario import SolicitudDocumentoPropietario
from app.schemas.solicitud_documento_propietario import SolicitudDocumentoPropietarioForm

TOKEN_EXPIRE_HOURS = 48


def create_solicitud_documento_propietario(
    *,
    session: Session,
    form: SolicitudDocumentoPropietarioForm,
    cedula_key: str,
    certificado_libertad_key: str,
    escritura_key: str,
    poder_key: str | None,
    comprobante_pago_key: str,
) -> SolicitudDocumentoPropietario:
    db_obj = SolicitudDocumentoPropietario(
        nombre_completo=form.nombre_completo,
        numero_contacto=form.numero_contacto,
        plan_contratado=form.plan_contratado,
        cedula_key=cedula_key,
        certificado_libertad_key=certificado_libertad_key,
        escritura_key=escritura_key,
        poder_key=poder_key,
        comprobante_pago_key=comprobante_pago_key,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_documentos_propietario(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudDocumentoPropietario], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudDocumentoPropietario))
    items = session.scalars(
        select(SolicitudDocumentoPropietario)
        .order_by(SolicitudDocumentoPropietario.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(items), count or 0


def get_solicitud_documento_by_id(
    *, session: Session, solicitud_id: uuid.UUID
) -> SolicitudDocumentoPropietario | None:
    return session.get(SolicitudDocumentoPropietario, solicitud_id)


def get_solicitud_documento_by_token(
    *, session: Session, token: str
) -> SolicitudDocumentoPropietario | None:
    solicitud = session.scalar(
        select(SolicitudDocumentoPropietario).where(SolicitudDocumentoPropietario.token == token)
    )
    if not solicitud:
        return None
    if solicitud.token_used_at is not None:
        return None
    if solicitud.token_expires_at is None or solicitud.token_expires_at <= utc_now():
        return None
    return solicitud


def validar_y_generar_token(
    *, session: Session, db_obj: SolicitudDocumentoPropietario
) -> SolicitudDocumentoPropietario:
    db_obj.validado = True
    db_obj.token = secrets.token_urlsafe(32)
    db_obj.token_expires_at = utc_now() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    db_obj.token_used_at = None
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def marcar_token_usado(*, session: Session, db_obj: SolicitudDocumentoPropietario) -> None:
    db_obj.token_used_at = utc_now()
    session.add(db_obj)
    session.commit()
