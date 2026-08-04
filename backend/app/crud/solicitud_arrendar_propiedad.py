from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.solicitud_arrendar_propiedad import SolicitudArrendarPropiedad
from app.schemas.solicitud_arrendar_propiedad import SolicitudArrendarPropiedadForm


def create_solicitud_arrendar_propiedad(
    *, session: Session, form: SolicitudArrendarPropiedadForm
) -> SolicitudArrendarPropiedad:
    db_obj = SolicitudArrendarPropiedad(
        nombre_propietario=form.nombre_propietario,
        medio_comunicacion=form.medio_comunicacion,
        numero_contacto=form.numero_contacto,
        direccion_inmueble=form.direccion_inmueble,
        observaciones=form.observaciones,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_arrendar_propiedad(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudArrendarPropiedad], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudArrendarPropiedad))
    items = session.scalars(
        select(SolicitudArrendarPropiedad)
        .order_by(SolicitudArrendarPropiedad.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(items), count or 0


def delete_solicitudes_arrendar_propiedad_antiguas(*, session: Session, dias: int) -> int:
    corte = utc_now() - timedelta(days=dias)
    result = session.execute(
        delete(SolicitudArrendarPropiedad).where(SolicitudArrendarPropiedad.created_at < corte)
    )
    session.commit()
    return result.rowcount  # type: ignore[attr-defined]
