from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.solicitud_arriendo import SolicitudArriendo
from app.schemas.solicitud_arriendo import SolicitudArriendoForm


def create_solicitud_arriendo(
    *, session: Session, form: SolicitudArriendoForm
) -> SolicitudArriendo:
    db_obj = SolicitudArriendo(
        nombre_completo=form.nombre_completo,
        numero_contacto=form.numero_contacto,
        sector_interes=form.sector_interes,
        precio_maximo=form.precio_maximo,
        medio_contacto=form.medio_contacto,
        observaciones=form.observaciones,
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def list_solicitudes_arriendo(
    *, session: Session, skip: int = 0, limit: int = 100
) -> tuple[list[SolicitudArriendo], int]:
    count = session.scalar(select(func.count()).select_from(SolicitudArriendo))
    items = session.scalars(
        select(SolicitudArriendo)
        .order_by(SolicitudArriendo.created_at.desc())
        .offset(skip)
        .limit(limit)
    ).all()
    return list(items), count or 0
