from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.solicitud_sugerencia import SolicitudSugerencia
from app.schemas.solicitud_sugerencia import SolicitudSugerenciaForm


def create_solicitud_sugerencia(
    *, session: Session, form: SolicitudSugerenciaForm
) -> SolicitudSugerencia:
    db_obj = SolicitudSugerencia(
        nombre=form.nombre,
        medio_comunicacion=form.medio_comunicacion,
        numero_contacto=form.numero_contacto,
        sugerencia=form.sugerencia,
        desea_contacto=form.desea_contacto,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_sugerencias(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudSugerencia], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudSugerencia))
    items = session.scalars(
        select(SolicitudSugerencia)
        .order_by(SolicitudSugerencia.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(items), count or 0


def delete_solicitudes_sugerencias_antiguas(*, session: Session, dias: int) -> int:
    corte = utc_now() - timedelta(days=dias)
    result = session.execute(
        delete(SolicitudSugerencia).where(SolicitudSugerencia.created_at < corte)
    )
    session.commit()
    return result.rowcount  # type: ignore[attr-defined]
