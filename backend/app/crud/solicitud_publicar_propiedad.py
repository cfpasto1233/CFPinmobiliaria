from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.db.base import utc_now
from app.models.solicitud_publicar_propiedad import SolicitudPublicarPropiedad
from app.schemas.solicitud_publicar_propiedad import SolicitudPublicarPropiedadForm


def create_solicitud_publicar_propiedad(
    *, session: Session, form: SolicitudPublicarPropiedadForm
) -> SolicitudPublicarPropiedad:
    db_obj = SolicitudPublicarPropiedad(
        nombre_propietario=form.nombre_propietario,
        medio_comunicacion=form.medio_comunicacion,
        numero_contacto=form.numero_contacto,
        direccion_inmueble=form.direccion_inmueble,
        precio_estimado=form.precio_estimado,
        descripcion_caracteristicas=form.descripcion_caracteristicas,
        observaciones=form.observaciones,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_publicar_propiedad(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudPublicarPropiedad], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudPublicarPropiedad))
    items = session.scalars(
        select(SolicitudPublicarPropiedad)
        .order_by(SolicitudPublicarPropiedad.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(items), count or 0


def delete_solicitudes_publicar_propiedad_antiguas(*, session: Session, dias: int) -> int:
    corte = utc_now() - timedelta(days=dias)
    result = session.execute(
        delete(SolicitudPublicarPropiedad).where(SolicitudPublicarPropiedad.created_at < corte)
    )
    session.commit()
    return result.rowcount  # type: ignore[attr-defined]
