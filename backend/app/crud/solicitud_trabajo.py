import uuid

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.solicitud_trabajo import SolicitudTrabajo
from app.schemas.solicitud_trabajo import SolicitudTrabajoForm


def create_solicitud_trabajo(
    *, session: Session, form: SolicitudTrabajoForm, hoja_de_vida_key: str
) -> SolicitudTrabajo:
    db_obj = SolicitudTrabajo(
        nombre=form.nombre,
        correo=form.correo,
        numero_contacto=form.numero_contacto,
        hoja_de_vida_key=hoja_de_vida_key,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_trabajo(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudTrabajo], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudTrabajo))
    items = session.scalars(
        select(SolicitudTrabajo).order_by(SolicitudTrabajo.created_at.desc()).offset(skip).limit(limit)
    ).all()
    return list(items), count or 0


def get_solicitud_trabajo_by_id(
    *, session: Session, solicitud_id: uuid.UUID
) -> SolicitudTrabajo | None:
    return session.get(SolicitudTrabajo, solicitud_id)
